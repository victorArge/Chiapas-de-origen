import { Link } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription.js'
import { formatDate } from '../utils/format.js'

function SubscriptionBanner() {
  const { subscription, loading } = useSubscription()

  if (loading || !subscription) return null

  const title = subscription.isTrial ? 'Prueba gratuita' : 'Suscripción activa'
  const detail = subscription.isActive
    ? `${subscription.daysRemaining} día(s) restantes · vence el ${formatDate(subscription.currentPeriodEnd)}`
    : `Venció el ${formatDate(subscription.currentPeriodEnd)}`

  return (
    <div className={`subscription-banner${subscription.isActive ? '' : ' is-expired'}`}>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <Link className="btn btn-outline" to="/suscripcion">
        Ver suscripción
      </Link>
    </div>
  )
}

export default SubscriptionBanner
