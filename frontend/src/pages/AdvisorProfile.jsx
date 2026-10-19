import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api.js'

function AdvisorProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get(`/advisors/${id}`)
      .then((data) => {
        if (!active) return
        setProfile(data.profile)
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
  }, [id])

  if (status === 'loading') return <p className="section muted">Cargando perfil...</p>
  if (status === 'error') return <p className="section error">No se pudo cargar el perfil: {error}</p>

  return (
    <section className="section narrow">
      <h2>{profile.name}</h2>
      <p className="card-meta">
        {profile.municipality}, {profile.state}
      </p>

      <ul className="tag-list">
        {profile.specialties.map((specialty) => (
          <li className="tag" key={specialty.id}>
            {specialty.name}
          </li>
        ))}
      </ul>

      <div className="detail-block">
        <h3>Descripción</h3>
        <p>{profile.description}</p>
      </div>

      <div className="detail-block">
        <h3>Experiencia</h3>
        <p>{profile.experience}</p>
      </div>

      <div className="detail-block">
        <h3>Contacto</h3>
        <p>{profile.contactInformation}</p>
      </div>

      <Link className="btn btn-primary" to={`/asesores/${profile.id}/solicitar`}>
        Solicitar asesoría
      </Link>
    </section>
  )
}

export default AdvisorProfile
