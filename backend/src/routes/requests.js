import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { formatZodError } from '../validators/auth.js';
import {
  createRequestSchema,
  updateStatusSchema,
  ALLOWED_TRANSITIONS,
} from '../validators/request.js';

const router = Router();

const includeRequest = {
  advisoryType: { select: { id: true, name: true } },
  advisorProfile: { include: { user: { select: { id: true, name: true } } } },
  requester: { select: { id: true, name: true } },
};

function toPublicRequest(request) {
  return {
    id: request.id,
    problemDescription: request.problemDescription,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    advisoryType: request.advisoryType,
    advisor: {
      id: request.advisorProfile.id,
      name: request.advisorProfile.user.name,
    },
    requester: request.requester,
  };
}

router.post('/', authenticate, authorize('PRODUCER'), async (req, res, next) => {
  try {
    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: formatZodError(parsed.error) });
    }

    const { advisorProfileId, advisoryTypeId, problemDescription } = parsed.data;

    const advisorProfile = await prisma.advisorProfile.findUnique({ where: { id: advisorProfileId } });
    if (!advisorProfile) {
      return res.status(404).json({ error: 'Asesor no encontrado' });
    }

    const offers = await prisma.advisorSpecialty.findUnique({
      where: {
        advisorProfileId_advisoryTypeId: { advisorProfileId, advisoryTypeId },
      },
    });
    if (!offers) {
      return res.status(400).json({ error: 'El asesor no ofrece esa especialidad' });
    }

    const request = await prisma.advisoryRequest.create({
      data: {
        requesterId: req.user.id,
        advisorProfileId,
        advisoryTypeId,
        problemDescription,
      },
      include: includeRequest,
    });

    res.status(201).json({ request: toPublicRequest(request) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    let where;

    if (req.user.role === 'PRODUCER') {
      where = { requesterId: req.user.id };
    } else if (req.user.role === 'ADVISOR') {
      const profile = await prisma.advisorProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) {
        return res.json({ items: [] });
      }
      where = { advisorProfileId: profile.id };
    } else {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const requests = await prisma.advisoryRequest.findMany({
      where,
      include: includeRequest,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items: requests.map(toPublicRequest) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', authenticate, authorize('ADVISOR'), async (req, res, next) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: formatZodError(parsed.error) });
    }

    const { status } = parsed.data;

    const request = await prisma.advisoryRequest.findUnique({
      where: { id: req.params.id },
      include: { advisorProfile: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (request.advisorProfile.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const allowed = ALLOWED_TRANSITIONS[request.status];
    if (!allowed.includes(status)) {
      return res
        .status(409)
        .json({ error: `No se puede pasar de ${request.status} a ${status}` });
    }

    const updated = await prisma.advisoryRequest.update({
      where: { id: request.id },
      data: { status },
      include: includeRequest,
    });

    res.json({ request: toPublicRequest(updated) });
  } catch (error) {
    next(error);
  }
});

export default router;
