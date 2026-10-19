import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

const EMPTY_FILTERS = { specialty: '', state: '', municipality: '', q: '' }

function buildQuery(filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim())
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

function Advisors() {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [types, setTypes] = useState([])
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/advisory-types')
      .then(setTypes)
      .catch(() => setTypes([]))
  }, [])

  useEffect(() => {
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
  }, [filters])

  const handleChange = (event) => {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setStatus('loading')
    setFilters(draft)
  }

  return (
    <section className="section">
      <h2>Buscar asesores</h2>

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
    </section>
  )
}

export default Advisors
