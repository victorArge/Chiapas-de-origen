import { Link } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription.js'

function SubscriptionGate({ children }) {
  const { subscription, loading, error, refresh } = useSubscription()

  if (loading && !subscription) {
    return <p className="section muted">Verificando tu suscripción...</p>
  }

  if (error && !subscription) {
    return (
      <section className="section narrow">
        <h2>No pudimos verificar tu suscripción</h2>
        <p className="error">{error}</p>
        <button className="btn btn-primary" type="button" onClick={refresh}>
          Intentar de nuevo
        </button>
      </section>
    )
  }

  if (!(subscription?.isActive && !subscription?.isTrial)) {
    return (
      <section className="section narrow">
        <p className="eyebrow">Acceso restringido</p>
        <h2>Necesitas una suscripción activa</h2>
        <p className="muted">
          Las solicitudes, paneles y herramientas de tu cuenta se habilitan con una
          suscripción vigente. Puedes revisar la simulación académica de activación; no
          se realiza ningún cargo real.
        </p>
        <Link className="btn btn-primary" to="/suscripcion">
          Ver mi suscripción
        </Link>
      </section>
    )
  }

  return children
}

export default SubscriptionGate
