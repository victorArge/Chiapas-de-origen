import { Router } from 'express'
import { existsSync } from 'node:fs'
import { prisma } from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { resolveStoragePath, serializeDocument } from '../lib/storage.js'
import { DEMO_NOTICE } from '../lib/plans.js'
import { serializePayment } from '../lib/payments.js'
import {
  isSubscriptionActive,
  serializeSubscription,
} from '../lib/subscriptions.js'
import { formatZodError } from '../validators/auth.js'
import {
  adminPaymentQuerySchema,
  adminSubscriptionQuerySchema,
  adminUserQuerySchema,
} from '../validators/admin.js'
import { rejectVerificationSchema, verificationQuerySchema } from '../validators/verification.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

const adminUserInclude = {
  subscription: true,
  advisorProfile: {
    include: {
      verification: { select: { status: true, rejectionReason: true, reviewedAt: true } },
      specialties: {
        include: { advisoryType: { select: { id: true, name: true } } },
      },
      _count: { select: { requests: true } },
    },
  },
  _count: { select: { requests: true, payments: true } },
}

function toAdminUser(user) {
  const verification = user.advisorProfile?.verification

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    subscription: serializeSubscription(user.subscription),
    advisorProfile: user.advisorProfile
      ? {
          id: user.advisorProfile.id,
          state: user.advisorProfile.state,
          municipality: user.advisorProfile.municipality,
          description: user.advisorProfile.description,
          experience: user.advisorProfile.experience,
          contactInformation: user.advisorProfile.contactInformation,
          verificationStatus: verification?.status || 'NOT_SUBMITTED',
          verificationRejectionReason: verification?.rejectionReason || null,
          verified:
            verification?.status === 'APPROVED' &&
            isSubscriptionActive(user.subscription),
          specialties: user.advisorProfile.specialties.map(
            (specialty) => specialty.advisoryType,
          ),
          receivedRequests: user.advisorProfile._count.requests,
        }
      : null,
    sentRequests: user._count.requests,
    payments: user._count.payments,
  }
}

async function expireOutdatedSubscriptions() {
  await prisma.subscription.updateMany({
    where: { status: 'ACTIVE', currentPeriodEnd: { lte: new Date() } },
    data: { status: 'EXPIRED' },
  })
}

router.get('/overview', async (req, res, next) => {
  try {
    await expireOutdatedSubscriptions()

    const now = new Date()
    const [
      usersTotal,
      producers,
      advisors,
      admins,
      subscriptionsTotal,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      pendingVerifications,
      approvedVerifications,
      rejectedVerifications,
      paymentsTotal,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      approvedAmount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PRODUCER' } }),
      prisma.user.count({ where: { role: 'ADVISOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE', currentPeriodEnd: { gt: now } },
      }),
      prisma.subscription.count({ where: { status: 'EXPIRED' } }),
      prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      prisma.advisorVerification.count({ where: { status: 'PENDING' } }),
      prisma.advisorVerification.count({ where: { status: 'APPROVED' } }),
      prisma.advisorVerification.count({ where: { status: 'REJECTED' } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'APPROVED' } }),
      prisma.payment.count({ where: { status: 'REJECTED' } }),
      prisma.payment.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amountMxn: true },
      }),
    ])

    res.json({
      demo: true,
      notice: DEMO_NOTICE,
      generatedAt: now,
      users: { total: usersTotal, producers, advisors, admins },
      subscriptions: {
        total: subscriptionsTotal,
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        cancelled: cancelledSubscriptions,
      },
      verifications: {
        pending: pendingVerifications,
        approved: approvedVerifications,
        rejected: rejectedVerifications,
      },
      payments: {
        total: paymentsTotal,
        pending: pendingPayments,
        approved: approvedPayments,
        rejected: rejectedPayments,
        approvedAmountMxn: approvedAmount._sum.amountMxn || 0,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/users', async (req, res, next) => {
  try {
    const parsed = adminUserQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Filtros inválidos', details: formatZodError(parsed.error) })
    }

    await expireOutdatedSubscriptions()

    const { role, q } = parsed.data
    const where = {}

    if (role) where.role = role
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: adminUserInclude,
      orderBy: { createdAt: 'desc' },
    })

    res.json({ total: users.length, items: users.map(toAdminUser) })
  } catch (error) {
    next(error)
  }
})

router.get('/users/:id', async (req, res, next) => {
  try {
    await expireOutdatedSubscriptions()

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        ...adminUserInclude,
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({
      user: toAdminUser(user),
      recentPayments: user.payments.map(serializePayment),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/subscriptions', async (req, res, next) => {
  try {
    const parsed = adminSubscriptionQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Filtros inválidos', details: formatZodError(parsed.error) })
    }

    await expireOutdatedSubscriptions()

    const { status, role } = parsed.data
    const where = {}

    if (status) where.status = status
    if (role) where.user = { role }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      demo: true,
      notice: DEMO_NOTICE,
      total: subscriptions.length,
      items: subscriptions.map((subscription) => ({
        ...serializeSubscription(subscription),
        user: subscription.user,
      })),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/payments', async (req, res, next) => {
  try {
    const parsed = adminPaymentQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Filtros inválidos', details: formatZodError(parsed.error) })
    }

    const { status, type } = parsed.data
    const where = {}

    if (status) where.status = status
    if (type) where.type = type

    const payments = await prisma.payment.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      demo: true,
      notice: DEMO_NOTICE,
      total: payments.length,
      items: payments.map((payment) => ({
        ...serializePayment(payment),
        user: payment.user,
      })),
    })
  } catch (error) {
    next(error)
  }
})

const verificationInclude = {
  reviewedBy: { select: { id: true, name: true } },
  advisorProfile: {
    include: {
      user: { select: { id: true, name: true, email: true } },
      specialties: {
        include: { advisoryType: { select: { id: true, name: true } } },
      },
    },
  },
  documents: { orderBy: { createdAt: 'desc' } },
  reviews: {
    orderBy: { createdAt: 'desc' },
    include: { reviewer: { select: { id: true, name: true } } },
  },
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

function toAdminVerification(verification) {
  const profile = verification.advisorProfile

  return {
    id: verification.id,
    status: verification.status,
    rejectionReason: verification.rejectionReason,
    submittedAt: verification.submittedAt,
    reviewedAt: verification.reviewedAt,
    reviewedBy: verification.reviewedBy,
    advisor: {
      profileId: profile.id,
      userId: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      description: profile.description,
      experience: profile.experience,
      state: profile.state,
      municipality: profile.municipality,
      contactInformation: profile.contactInformation,
      specialties: profile.specialties.map((specialty) => specialty.advisoryType),
    },
    documents: verification.documents.map((document) => ({
      ...serializeDocument(document),
      downloadUrl: `/api/admin/documents/${document.id}/download`,
    })),
    reviews: verification.reviews.map(serializeReview),
  }
}

router.get('/verifications', async (req, res, next) => {
  try {
    const parsed = verificationQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Filtros inválidos', details: formatZodError(parsed.error) })
    }

    const where = parsed.data.status ? { status: parsed.data.status } : {}

    const verifications = await prisma.advisorVerification.findMany({
      where,
      include: verificationInclude,
      orderBy: [{ submittedAt: 'asc' }, { createdAt: 'asc' }],
    })

    res.json({ total: verifications.length, items: verifications.map(toAdminVerification) })
  } catch (error) {
    next(error)
  }
})

router.get('/verifications/:id', async (req, res, next) => {
  try {
    const verification = await prisma.advisorVerification.findUnique({
      where: { id: req.params.id },
      include: verificationInclude,
    })

    if (!verification) {
      return res.status(404).json({ error: 'Verificación no encontrada' })
    }

    res.json({ verification: toAdminVerification(verification) })
  } catch (error) {
    next(error)
  }
})

router.get('/documents/:id/download', async (req, res, next) => {
  try {
    const document = await prisma.advisorDocument.findUnique({ where: { id: req.params.id } })

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' })
    }

    const absolute = resolveStoragePath(document.storagePath)

    if (!absolute || !existsSync(absolute)) {
      return res.status(404).json({ error: 'El archivo no está disponible' })
    }

    res.setHeader('Cache-Control', 'private, no-store')
    return res.download(absolute, document.originalName)
  } catch (error) {
    next(error)
  }
})

router.post('/verifications/:id/approve', async (req, res, next) => {
  try {
    const existing = await prisma.advisorVerification.findUnique({ where: { id: req.params.id } })

    if (!existing) {
      return res.status(404).json({ error: 'Verificación no encontrada' })
    }

    if (existing.status !== 'PENDING') {
      return res.status(409).json({
        error: 'Solo se pueden aprobar verificaciones pendientes.',
        status: existing.status,
      })
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.advisorVerification.update({
        where: { id: existing.id },
        data: {
          status: 'APPROVED',
          rejectionReason: null,
          reviewedAt: new Date(),
          reviewedById: req.user.id,
        },
      })

      await tx.verificationReview.create({
        data: {
          verificationId: existing.id,
          reviewerId: req.user.id,
          decision: 'APPROVED',
        },
      })

      return tx.advisorVerification.findUnique({
        where: { id: existing.id },
        include: verificationInclude,
      })
    })

    res.json({ verification: toAdminVerification(updated) })
  } catch (error) {
    next(error)
  }
})

router.post('/verifications/:id/reject', async (req, res, next) => {
  try {
    const parsed = rejectVerificationSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: formatZodError(parsed.error) })
    }

    const existing = await prisma.advisorVerification.findUnique({ where: { id: req.params.id } })

    if (!existing) {
      return res.status(404).json({ error: 'Verificación no encontrada' })
    }

    if (existing.status !== 'PENDING') {
      return res.status(409).json({
        error: 'Solo se pueden rechazar verificaciones pendientes.',
        status: existing.status,
      })
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.advisorVerification.update({
        where: { id: existing.id },
        data: {
          status: 'REJECTED',
          rejectionReason: parsed.data.reason,
          reviewedAt: new Date(),
          reviewedById: req.user.id,
        },
      })

      await tx.verificationReview.create({
        data: {
          verificationId: existing.id,
          reviewerId: req.user.id,
          decision: 'REJECTED',
          reason: parsed.data.reason,
        },
      })

      return tx.advisorVerification.findUnique({
        where: { id: existing.id },
        include: verificationInclude,
      })
    })

    res.json({ verification: toAdminVerification(updated) })
  } catch (error) {
    next(error)
  }
})

export default router
