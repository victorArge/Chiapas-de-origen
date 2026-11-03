import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { requireActiveSubscription } from '../middleware/subscription.js'
import { uploadDocument } from '../middleware/upload.js'
import { removeStoredFile, serializeDocument, toStorageRelative } from '../lib/storage.js'
import { formatZodError } from '../validators/auth.js'
import { documentTypeSchema } from '../validators/verification.js'

const router = Router()

router.use(authenticate, authorize('ADVISOR'), requireActiveSubscription)

const verificationDetails = {
  reviewedBy: { select: { id: true, name: true } },
  documents: { orderBy: { createdAt: 'desc' } },
  reviews: {
    orderBy: { createdAt: 'desc' },
    include: { reviewer: { select: { id: true, name: true } } },
  },
}

function loadProfile(userId) {
  return prisma.advisorProfile.findUnique({
    where: { userId },
    include: {
      specialties: { select: { advisoryTypeId: true } },
      verification: { include: verificationDetails },
    },
  })
}

function serializeReview(review) {
  return {
    id: review.id,
    decision: review.decision,
    reason: review.reason,
    createdAt: review.createdAt,
    reviewer: review.reviewer,
  }
}

function verificationPayload(profile) {
  const verification = profile?.verification

  return {
    profileComplete: Boolean(profile && profile.specialties.length > 0),
    verification: verification
      ? {
          id: verification.id,
          status: verification.status,
          rejectionReason: verification.rejectionReason,
          submittedAt: verification.submittedAt,
          reviewedAt: verification.reviewedAt,
          reviewedBy: verification.reviewedBy,
          createdAt: verification.createdAt,
          updatedAt: verification.updatedAt,
        }
      : null,
    documents: verification ? verification.documents.map(serializeDocument) : [],
    reviews: verification ? verification.reviews.map(serializeReview) : [],
  }
}

async function ensureProfileComplete(userId) {
  const profile = await prisma.advisorProfile.findUnique({
    where: { userId },
    include: { specialties: { select: { advisoryTypeId: true } } },
  })

  if (!profile || profile.specialties.length === 0) {
    return { profile: null, error: 'Completa tu perfil profesional y selecciona al menos una especialidad.' }
  }

  return { profile, error: null }
}

router.get('/', async (req, res, next) => {
  try {
    const profile = await loadProfile(req.user.id)
    res.json(verificationPayload(profile))
  } catch (error) {
    next(error)
  }
})

router.post('/documents', uploadDocument, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Adjunta un archivo PDF, JPG o PNG.' })
    }

    const parsedType = documentTypeSchema.safeParse(req.body.type)

    if (!parsedType.success) {
      await removeStoredFile(toStorageRelative(req.file.path))
      return res.status(400).json({
        error: 'Datos inválidos',
        details: formatZodError(parsedType.error),
      })
    }

    const { profile, error } = await ensureProfileComplete(req.user.id)

    if (!profile) {
      await removeStoredFile(toStorageRelative(req.file.path))
      return res.status(409).json({ error })
    }

    let verification = await prisma.advisorVerification.findUnique({
      where: { advisorProfileId: profile.id },
    })

    if (!verification) {
      verification = await prisma.advisorVerification.create({
        data: { advisorProfileId: profile.id },
      })
    }

    if (verification.status === 'APPROVED') {
      await removeStoredFile(toStorageRelative(req.file.path))
      return res.status(409).json({
        error: 'Tu verificación ya fue aprobada. No puedes agregar más documentos por ahora.',
      })
    }

    let document

    try {
      document = await prisma.advisorDocument.create({
        data: {
          verificationId: verification.id,
          type: parsedType.data,
          originalName: req.file.originalname,
          storedName: req.file.filename,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          storagePath: toStorageRelative(req.file.path),
        },
      })
    } catch (error) {
      await removeStoredFile(toStorageRelative(req.file.path))
      throw error
    }

    res.status(201).json({
      document: serializeDocument(document),
      verification: { id: verification.id, status: verification.status },
    })
  } catch (error) {
    next(error)
  }
})

router.delete('/documents/:documentId', async (req, res, next) => {
  try {
    const document = await prisma.advisorDocument.findUnique({
      where: { id: req.params.documentId },
      include: { verification: { include: { advisorProfile: { select: { userId: true } } } } },
    })

    if (!document || document.verification.advisorProfile.userId !== req.user.id) {
      return res.status(404).json({ error: 'Documento no encontrado' })
    }

    if (document.verification.status === 'PENDING') {
      return res.status(409).json({
        error: 'La verificación está en revisión. No puedes eliminar documentos en este momento.',
      })
    }

    if (document.verification.status === 'APPROVED') {
      return res.status(409).json({
        error: 'La verificación ya fue aprobada. No puedes eliminar documentos.',
      })
    }

    await prisma.advisorDocument.delete({ where: { id: document.id } })
    await removeStoredFile(document.storagePath)

    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

router.post('/submit', async (req, res, next) => {
  try {
    const { profile, error } = await ensureProfileComplete(req.user.id)

    if (!profile) {
      return res.status(409).json({ error })
    }

    const verification = await prisma.advisorVerification.findUnique({
      where: { advisorProfileId: profile.id },
      include: { documents: { select: { id: true } } },
    })

    if (!verification || verification.documents.length === 0) {
      return res.status(400).json({ error: 'Sube al menos un documento antes de enviar a revisión.' })
    }

    if (verification.status === 'PENDING') {
      return res.status(409).json({ error: 'Tu verificación ya está en revisión.' })
    }

    if (verification.status === 'APPROVED') {
      return res.status(409).json({ error: 'Tu verificación ya fue aprobada.' })
    }

    await prisma.advisorVerification.update({
      where: { id: verification.id },
      data: {
        status: 'PENDING',
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedById: null,
        rejectionReason: null,
      },
    })

    const updatedProfile = await loadProfile(req.user.id)
    res.json(verificationPayload(updatedProfile))
  } catch (error) {
    next(error)
  }
})

export default router
