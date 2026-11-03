import { prisma } from './prisma.js'
import {
  PLAN_DURATION_DAYS,
  TRIAL_DURATION_DAYS,
  planByCode,
  planForRole,
} from './plans.js'

const DAY_MS = 24 * 60 * 60 * 1000

export function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS)
}

export function isSubscriptionActive(subscription) {
  if (!subscription || subscription.status !== 'ACTIVE') return false
  return subscription.currentPeriodEnd.getTime() > Date.now()
}

export function serializeSubscription(subscription) {
  if (!subscription) return null

  const plan = planByCode(subscription.plan)
  const active = isSubscriptionActive(subscription)
  const daysRemaining = active
    ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / DAY_MS))
    : 0

  return {
    id: subscription.id,
    plan: subscription.plan,
    planName: plan?.name || subscription.plan,
    priceMxn: subscription.priceMxn,
    currency: plan?.currency || 'MXN',
    status: subscription.status,
    isTrial: subscription.isTrial,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    isActive: active,
    daysRemaining,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  }
}

export async function syncSubscriptionStatus(subscription) {
  if (!subscription) return null

  if (subscription.status === 'ACTIVE' && subscription.currentPeriodEnd.getTime() <= Date.now()) {
    return prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'EXPIRED' },
    })
  }

  return subscription
}

export async function ensureSubscription(userId, role) {
  if (role !== 'PRODUCER' && role !== 'ADVISOR') return null

  const existing = await prisma.subscription.findUnique({ where: { userId } })
  if (existing) return syncSubscriptionStatus(existing)

  const plan = planForRole(role)
  const now = new Date()
  const periodEnd = addDays(now, TRIAL_DURATION_DAYS)

  try {
    return await prisma.subscription.create({
      data: {
        userId,
        plan: plan.code,
        priceMxn: plan.priceMxn,
        status: 'ACTIVE',
        isTrial: true,
        trialEndsAt: periodEnd,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    })
  } catch (error) {
    if (error?.code === 'P2002') {
      const subscription = await prisma.subscription.findUnique({ where: { userId } })
      return syncSubscriptionStatus(subscription)
    }
    throw error
  }
}

export async function activateSubscription(db, { userId, role }) {
  const plan = planForRole(role)
  const now = new Date()
  const existing = await db.subscription.findUnique({ where: { userId } })

  const canExtend =
    existing &&
    !existing.isTrial &&
    existing.status === 'ACTIVE' &&
    existing.currentPeriodEnd.getTime() > now.getTime()

  const periodEnd = addDays(canExtend ? existing.currentPeriodEnd : now, PLAN_DURATION_DAYS)

  const data = {
    plan: plan.code,
    priceMxn: plan.priceMxn,
    status: 'ACTIVE',
    isTrial: false,
    trialEndsAt: null,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  }

  if (existing) {
    return db.subscription.update({ where: { id: existing.id }, data })
  }

  return db.subscription.create({ data: { userId, ...data } })
}
