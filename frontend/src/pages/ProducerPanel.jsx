import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'
import RequestCard from '../components/RequestCard.jsx'

function ProducerPanel() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get('/requests/me')
      .then((data) => {
        if (!active) return
        setRequests(data.items)
        setStatus('ready')
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="section">
      <h2>Panel del productor</h2>
      <p className="muted">Hola, {user?.name}. Estas son tus solicitudes de asesoría.</p>

      {status === 'loading' && <p className="muted">Cargando solicitudes...</p>}
      {status === 'error' && <p className="error">No se pudieron cargar: {error}</p>}

      {status === 'ready' &&
        (requests.length === 0 ? (
          <p className="muted">Aún no has enviado solicitudes de asesoría.</p>
        ) : (
          <div className="request-list">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} perspective="producer" />
            ))}
          </div>
        ))}
    </section>
  )
}

export default ProducerPanel
