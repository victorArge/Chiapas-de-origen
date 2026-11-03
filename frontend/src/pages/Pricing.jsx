import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { usePlans } from '../hooks/usePlans.js'
import { formatCurrency } from '../utils/format.js'

const PLAN_FEATURES = {
  PRODUCER: [
    'Consulta de las cuatro especialidades agronómicas',
    'Búsqueda y filtros de asesores verificados',
    'Perfiles profesionales completos',
    'Solicitudes de asesoría y seguimiento',
  ],
  ADVISOR: [
    'Perfil profesional publicado en el directorio',
    'Recepción de solicitudes de productores',
    'Gestión de especialidades y datos de contacto',
    'Verificación administrativa de documentos',
  ],
}

function planCta(role, user) {
  if (!user) {
    return {
      to: `/registro?rol=${role === 'ADVISOR' ? 'asesor' : 'productor'}`,
      label: 'Crear cuenta',
    }
  }
  if (user.role === 'ADMIN') {
    return { to: '/panel/admin', label: 'Ir al panel' }
  }
  if (user.role === role) {
    return { to: '/suscripcion/pago', label: 'Ir al checkout' };
  }
  return { to: '/precios', label: 'Disponible para otro rol' }
}

function Pricing() {
  const { user } = useAuth()
  const { items, trialDays, notice, loading, error } = usePlans()

  return (
    <section className="section">
      <header className="section-head">
        <p className="eyebrow">Suscripciones</p>
        <h2>Planes mensuales en pesos mexicanos</h2>
        <p className="section-sub">
          Cada cuenta nueva incluye {trialDays || 30} días de prueba. Los pagos de esta
          versión son simulados: no se cobra dinero real ni se solicitan datos de tarjetas.
        </p>
      </header>

      {loading && <p className="muted">Cargando planes...</p>}
      {error && <p className="error">No se pudieron cargar los planes: {error}</p>}

      {!loading && !error && (
        <>
          <div className="pricing-grid">
            {items.map((plan) => {
              const cta = planCta(plan.role, user)
              const currentPlan = user?.role === plan.role

              return (
                <article
                  className={`pricing-card${currentPlan ? ' is-current' : ''}`}
                  key={plan.code}
                >
                  <div className="pricing-card-head">
                    <p className="eyebrow">
                      {plan.role === 'PRODUCER' ? 'Para productores' : 'Para asesores'}
                    </p>
                    <h3>{plan.name}</h3>
                  </div>

                  <p className="pricing-price">
                    {formatCurrency(plan.priceMxn, plan.currency)}
                    <span> MXN / mes</span>
                  </p>

                  <p className="muted">{plan.description}</p>

                  <ul className="pricing-features">
                    {(PLAN_FEATURES[plan.role] || []).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>

                  <Link className="btn btn-primary" to={cta.to}>
                    {currentPlan ? 'Ir al checkout' : cta.label}
                  </Link>
                </article>
              )
            })}
          </div>

          <div className="demo-panel">
            <strong>Entorno DEMO</strong>
            <p>{notice}</p>
          </div>
        </>
      )}
    </section>
  )
}

export default Pricing
