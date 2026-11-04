import { ensureSubscription, isSubscriptionActive, serializeSubscription } from '../lib/subscriptions.js'
import { DEMO_NOTICE } from '../lib/plans.js'

export async function requireActiveSubscription(req, res, next) {
  try {
    const subscription = await ensureSubscription(req.user.id, req.user.role)

    if (!subscription) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    if (subscription.isTrial || !isSubscriptionActive(subscription)) {
      return res.status(402).json({
        error: 'Tu suscripción no está activa. Renueva para continuar.',
        code: 'SUBSCRIPTION_REQUIRED',
        demo: true,
        notice: DEMO_NOTICE,
        subscription: serializeSubscription(subscription),
      })
    }

    req.subscription = subscription
    return next()
  } catch (error) {
    return next(error)
  }
}
