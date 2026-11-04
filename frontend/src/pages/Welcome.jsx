import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'
import { useSubscription } from '../hooks/useSubscription.js'
import { formatCurrency } from '../utils/format.js'
import { CheckIcon } from '../components/Icons.jsx'
const bienvenidaImg = '/images/BienvenidosaChiapasdeOrigen.png'

function Welcome() {
  const { user } = useAuth()
  const { subscription, plan } = useSubscription()
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState('NOT_SUBMITTED')

  const isProducer = user?.role === 'PRODUCER'
  const isAdvisor = user?.role === 'ADVISOR'
  const isActive = Boolean(subscription?.isActive) && !subscription?.isTrial

  useEffect(() => {
    if (user?.role !== 'ADVISOR') {
      return undefined
    }

    let active = true

    api
      .get('/advisors/me/verification')
      .then((data) => {
        if (!active) return
        setVerificationStatus(data?.verification?.status || 'NOT_SUBMITTED')
      })
      .catch(() => {
        if (active) setVerificationStatus('NOT_SUBMITTED')
      })

    return () => {
      active = false
    }
  }, [user?.role])

  if (user?.role === 'ADMIN') {
    return <Navigate to="/panel/admin" replace />
  }

  if (isActive && isProducer) {
    return <Navigate to="/panel/productor" replace />
  }

  if (isActive && isAdvisor && verificationStatus === 'APPROVED') {
    return <Navigate to="/panel/asesor" replace />
  }

  const isAdvisorPending =
    isAdvisor && isActive && verificationStatus !== 'APPROVED'

  const price = plan?.priceMxn ?? (isProducer ? 300 : isAdvisor ? 600 : 0)
  const currency = plan?.currency || 'MXN'

  return (
    <section className="section">
      {isAdvisorPending ? (
        <div className="advisor-grid">
          <div className="advisor-copy">
            <p className="eyebrow">Asesor agronómico</p>
            <h2>Estás dentro del proceso de activación</h2>
            <p>
              La simulación académica quedó registrada. Estamos esperando la revisión de tu
              documentación profesional para habilitar el panel profesional.
            </p>
            <p className="advisor-lock-message">Contenido exclusivo para agricultores suscritos</p>
            <div className="hero-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate('/panel/asesor')}
              >
                Ir a mi panel de asesor
              </button>
            </div>
          </div>
          <div className="advisor-media">
            <img src={bienvenidaImg} alt="Bienvenido a Chiapas de origen" />
          </div>
        </div>
      ) : (
        <div className="advisor-grid">
          <div className="advisor-copy">
            <p className="eyebrow">¡Bienvenido a Chiapas de origen!</p>
            <h2>¡Bienvenido a Chiapas de origen!</h2>
            <p>
              Conecta a productores agrícolas de plátano con asesores agrónomos
              especializados para mejorar la salud y productividad del cultivo.
            </p>
            <p className="advisor-lock-price">{formatCurrency(price, currency)} MXN</p>
            <p className="advisor-lock-duration">30 días</p>
            <ul className="hero-points">
              <li>
                <CheckIcon /> Orientación técnica especializada
              </li>
              <li>
                <CheckIcon /> Seguimiento continuo del cultivo
              </li>
              <li>
                <CheckIcon /> Soluciones para tu finca
              </li>
            </ul>
            <div className="hero-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate('/suscripcion')}
              >
                Continuar con la simulación de pago
              </button>
            </div>
          </div>
          <div className="advisor-media">
            <img src={bienvenidaImg} alt="Bienvenido a Chiapas de origen" />
          </div>
        </div>
      )}
    </section>
  )
}

export default Welcome
