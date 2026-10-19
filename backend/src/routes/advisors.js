import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { formatZodError } from '../validators/auth.js';
import { advisorProfileSchema, advisorQuerySchema } from '../validators/advisor.js';

const router = Router();

const includeProfile = {
  user: { select: { id: true, name: true } },
  specialties: {
    include: { advisoryType: { select: { id: true, name: true } } },
  },
};

function toPublicProfile(profile) {
  return {
    id: profile.id,
    name: profile.user.name,
    description: profile.description,
    experience: profile.experience,
    state: profile.state,
    municipality: profile.municipality,
    contactInformation: profile.contactInformation,
    specialties: profile.specialties.map((s) => ({
      id: s.advisoryType.id,
      name: s.advisoryType.name,
    })),
  };
}

async function validSpecialtyIds(specialtyIds) {
  const unique = [...new Set(specialtyIds)];
  const found = await prisma.advisoryType.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });
  return found.length === unique.length ? unique : null;
}

router.get('/', async (req, res, next) => {
  try {
    const parsed = advisorQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Filtros inválidos', details: formatZodError(parsed.error) });
    }

    const { specialty, state, municipality, q } = parsed.data;
    const where = {};

    if (specialty) {
      where.specialties = { some: { advisoryTypeId: specialty } };
    }
    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }
    if (municipality) {
      where.municipality = { contains: municipality, mode: 'insensitive' };
    }
    if (q) {
      where.user = { name: { contains: q, mode: 'insensitive' } };
    }

    const profiles = await prisma.advisorProfile.findMany({
      where,
      include: includeProfile,
      orderBy: { user: { name: 'asc' } },
    });

    res.json({ total: profiles.length, items: profiles.map(toPublicProfile) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, authorize('ADVISOR'), async (req, res, next) => {
  try {
    const profile = await prisma.advisorProfile.findUnique({
      where: { userId: req.user.id },
      include: includeProfile,
    });

    if (!profile) {
      return res.json({ profile: null });
    }

    res.json({ profile: toPublicProfile(profile) });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADVISOR'), async (req, res, next) => {
  try {
    const parsed = advisorProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: formatZodError(parsed.error) });
    }

    const { description, experience, state, municipality, contactInformation, specialtyIds } = parsed.data;

    const specialtyIdList = await validSpecialtyIds(specialtyIds);
    if (!specialtyIdList) {
      return res.status(400).json({ error: 'Una o más especialidades no existen' });
    }

    const existing = await prisma.advisorProfile.findUnique({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(409).json({ error: 'Ya tienes un perfil de asesor' });
    }

    const profile = await prisma.advisorProfile.create({
      data: {
        userId: req.user.id,
        description,
        experience,
        state,
        municipality,
        contactInformation,
        specialties: {
          create: specialtyIdList.map((advisoryTypeId) => ({ advisoryTypeId })),
        },
      },
      include: includeProfile,
    });

    res.status(201).json({ profile: toPublicProfile(profile) });
  } catch (error) {
    next(error);
  }
});

router.put('/me', authenticate, authorize('ADVISOR'), async (req, res, next) => {
  try {
    const parsed = advisorProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: formatZodError(parsed.error) });
    }

    const { description, experience, state, municipality, contactInformation, specialtyIds } = parsed.data;

    const specialtyIdList = await validSpecialtyIds(specialtyIds);
    if (!specialtyIdList) {
      return res.status(400).json({ error: 'Una o más especialidades no existen' });
    }

    const existing = await prisma.advisorProfile.findUnique({ where: { userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Aún no tienes un perfil. Crea uno primero.' });
    }

    const profile = await prisma.$transaction(async (tx) => {
      const updated = await tx.advisorProfile.update({
        where: { id: existing.id },
        data: { description, experience, state, municipality, contactInformation },
        include: includeProfile,
      });

      await tx.advisorSpecialty.deleteMany({ where: { advisorProfileId: existing.id } });
      await tx.advisorSpecialty.createMany({
        data: specialtyIdList.map((advisoryTypeId) => ({
          advisorProfileId: existing.id,
          advisoryTypeId,
        })),
      });

      return updated;
    });

    const full = await prisma.advisorProfile.findUnique({
      where: { id: profile.id },
      include: includeProfile,
    });

    res.json({ profile: toPublicProfile(full) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const profile = await prisma.advisorProfile.findUnique({
      where: { id: req.params.id },
      include: includeProfile,
    });

    if (!profile) {
      return res.status(404).json({ error: 'Asesor no encontrado' });
    }

    res.json({ profile: toPublicProfile(profile) });
  } catch (error) {
    next(error);
  }
});

export default router;
