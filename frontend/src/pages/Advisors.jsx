import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAdvisoryTypes } from '../hooks/useAdvisoryTypes.js'
import { useAuth } from '../hooks/useAuth.js'
import { useSubscription } from '../hooks/useSubscription.js'
import SubscriptionGate from '../components/SubscriptionGate.jsx'
import encuentraAsesor from '../../../imagenes/encuentra un asesor.jpeg'

const EMPTY_FILTERS = { specialty: '', state: '', municipality: '', q: '' }

function readFilters(params) {
  return {
    specialty: params.get('specialty') || '',
    state: params.get('state') || '',
    municipality: params.get('municipality') || '',
    q: params.get('q') || '',
  }
}

function buildParams(filters) {
  const params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) params[key] = value.trim()
  })
  return params
}

function buildQuery(filters) {
  const query = new URLSearchParams(buildParams(filters)).toString()
  return query ? `?${query}` : ''
}

function Advisors() {
  const types = useAdvisoryTypes()
  const { user } = useAuth()
  const { subscription, loading: subscriptionLoading } = useSubscription()
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState(() => readFilters(searchParams))
  const [filters, setFilters] = useState(() => readFilters(searchParams))
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const advisorAccessResolved = !subscriptionLoading
  const canAccessCatalog =
    advisorAccessResolved &&
    (user?.role === 'PRODUCER' || user?.role === 'ADVISOR') &&
    Boolean(subscription?.isActive) &&
    !subscription?.isTrial

  const advisorSectionVisible =
    user?.role !== 'ADMIN'

  const advisorCatalogLocked = !canAccessCatalog && advisorSectionVisible

  useEffect(() => {
    if (advisorCatalogLocked) {
      return
    }

    let active = true

    api
      .get(`/advisors${buildQuery(filters)}`)
      .then((data) => {
        if (!active) return
        setItems(data.items)
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
  }, [filters, advisorCatalogLocked])

  const handleChange = (event) => {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setStatus('loading')
    setSearchParams(buildParams(draft))
    setFilters({ ...EMPTY_FILTERS, ...draft })
  }

  return (
    <section className="section">
      <div className="advisor-grid">
        <div className="advisor-copy">
          <p className="eyebrow">Encuentra un asesor</p>
          <h2>Buscar asesores</h2>
          <p>
            Conecta con profesionales especializados en el cultivo de plátano y
            recibe orientación técnica para mejorar la salud y productividad de tu
            plantación.
          </p>
        </div>
        <div className="advisor-media">
          <img
            src={encuentraAsesor}
            alt="Asesor agrónomo de plátano revisando el cultivo en la finca"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      {advisorCatalogLocked ? (
        <SubscriptionGate />
      ) : (
        <>
          <form className="filters" onSubmit={handleSubmit}>
            <label className="field">
              <span>Especialidad</span>
              <select name="specialty" value={draft.specialty} onChange={handleChange}>
                <option value="">Todas</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Estado</span>
              <input name="state" value={draft.state} onChange={handleChange} placeholder="Chiapas" />
            </label>

            <label className="field">
              <span>Municipio</span>
              <input
                name="municipality"
                value={draft.municipality}
                onChange={handleChange}
                placeholder="Ej. Tapachula"
              />
            </label>

            <label className="field">
              <span>Nombre del asesor</span>
              <input name="q" value={draft.q} onChange={handleChange} placeholder="Buscar por nombre" />
            </label>

            <button className="btn btn-primary" type="submit">
              Buscar
            </button>
          </form>

          {status === 'loading' && <p className="muted">Buscando asesores...</p>}
          {status === 'error' && <p className="error">No se pudo buscar asesores: {error}</p>}

          {status === 'ready' && (
            <>
              <p className="muted">{items.length} asesor(es) encontrados</p>
              {items.length === 0 ? (
                <p className="muted">No hay asesores que coincidan con los filtros.</p>
              ) : (
                <div className="cards">
                  {items.map((profile) => (
                    <article className="card" key={profile.id}>
                      <h3>{profile.name}</h3>
                      {profile.verified && (
                        <p>
                          <span className="status status-approved">Asesor verificado</span>
                        </p>
                      )}
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
                      <p>{profile.description}</p>
                      <Link className="btn btn-outline" to={`/asesores/${profile.id}`}>
                        Ver perfil
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}

export default Advisors
