import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

function Specialties() {
  const [specialties, setSpecialties] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get('/advisory-types')
      .then((data) => {
        if (!active) return
        setSpecialties(data)
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
      <h2>Catálogo de especialidades</h2>

      {status === 'loading' && <p className="muted">Cargando especialidades...</p>}
      {status === 'error' && (
        <p className="error">No se pudieron cargar las especialidades: {error}</p>
      )}

      {status === 'ready' && (
        <div className="cards">
          {specialties.map((specialty) => (
            <article className="card" key={specialty.id}>
              <h3>{specialty.name}</h3>
              <p>{specialty.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Specialties
