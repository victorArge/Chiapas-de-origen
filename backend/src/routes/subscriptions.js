import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { PAYMENT_NOTICE, TRIAL_DURATION_DAYS, planByCode, planForRole, planList } from '../lib/plans.js'
import {
  activateSubscription,
  ensureSubscription,
  serializeSubscription,
} from '../lib/subscriptions.js'
import { formatZodError } from '../validators/auth.js'
import { serializePayment } from '../lib/payments.js'
import { rejectPaymentSchema } from '../validators/subscription.js'

const router = Router()

router.get('/plans', (req, res) => {
  res.json({
    demo: true,
    notice: PAYMENT_NOTICE,
    currency: 'MXN',
    trialDays: TRIAL_DURATION_DAYS,
    items: planList(),
  })
})

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const subscription = await ensureSubscription(req.user.id, req.user.role)

    if (!subscription) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const pendingPayment = await prisma.payment.findFirst({
      where: { userId: req.user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      demo: true,
      notice: PAYMENT_NOTICE,
      plan: planByCode(subscription.plan),
      subscription: serializeSubscription(subscription),
      pendingPayment: pendingPayment ? serializePayment(pendingPayment) : null,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/payments/me', authenticate, async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      demo: true,
      notice: PAYMENT_NOTICE,
      items: payments.map(serializePayment),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/payments', authenticate, async (req, res, next) => {
  try {
    const plan = planForRole(req.user.role)

    if (!plan) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const subscription = await ensureSubscription(req.user.id, req.user.role)

    const pendingPayment = await prisma.payment.findFirst({
      where: { userId: req.user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })

    if (pendingPayment) {
      return res.status(409).json({
        error: 'Ya tienes un pago pendiente. ConfÃ­rmalo o rechÃ¡zalo antes de crear otro.',
        payment: serializePayment(pendingPayment),
      })
    }

    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        subscriptionId: subscription.id,
        amountMxn: plan.priceMxn,
        currency: plan.currency,
        status: 'PENDING',
        type: subscription.isTrial ? 'INITIAL' : 'RENEWAL',
        reference: `PAY-${randomUUID()}`,
      },
    })

    res.status(201).json({
      demo: true,
      notice: PAYMENT_NOTICE,
      payment: serializePayment(payment),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/payments/:id/confirm', authenticate, async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, role: true } } },
    })

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' })
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    if (payment.status !== 'PENDING') {
      return res.status(409).json({
        error: `El pago ya fue ${payment.status === 'APPROVED' ? 'aprobado' : 'rechazado'}`,
        payment: serializePayment(payment),
      })
    }

    const { updatedPayment, subscription } = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'APPROVED', confirmedAt: new Date(), failureReason: null },
      })

      const activated = await activateSubscription(tx, {
        userId: payment.userId,
        role: payment.user.role,
      })

      return { updatedPayment: updated, subscription: activated }
    })

    res.json({
      demo: true,
      notice: PAYMENT_NOTICE,
      payment: serializePayment(updatedPayment),
      subscription: serializeSubscription(subscription),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/payments/:id/reject', authenticate, async (req, res, next) => {
  try {
    const parsed = rejectPaymentSchema.safeParse(req.body || {})
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos invÃ¡lidos', details: formatZodError(parsed.error) })
    }

    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } })

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' })
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    if (payment.status !== 'PENDING') {
      return res.status(409).json({
        error: `El pago ya fue ${payment.status === 'APPROVED' ? 'aprobado' : 'rechazado'}`,
        payment: serializePayment(payment),
      })
    }

    const rejected = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REJECTED',
        failureReason: parsed.data.reason || 'OperaciÃ³n rechazada',
      },
    })

    res.json({
      demo: true,
      notice: PAYMENT_NOTICE,
      payment: serializePayment(rejected),
    })
  } catch (error) {
    next(error)
  }
})

export default router

