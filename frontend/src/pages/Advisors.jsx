import { useState } from 'react'
import { Link } from 'react-router-dom'
import { specialties } from '../data/specialties.js'

function Advisors() {
  const [filters, setFilters] = useState({ specialty: '', state: '', municipality: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <section className="section">
      <h2>Buscar asesores</h2>

      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          <span>Especialidad</span>
          <select name="specialty" value={filters.specialty} onChange={handleChange}>
            <option value="">Todas</option>
            {specialties.map((specialty) => (
              <option key={specialty.slug} value={specialty.slug}>
                {specialty.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Estado</span>
          <input name="state" value={filters.state} onChange={handleChange} placeholder="Chiapas" />
        </label>

        <label className="field">
          <span>Municipio</span>
          <input
            name="municipality"
            value={filters.municipality}
            onChange={handleChange}
            placeholder="Ej. Tapachula"
          />
        </label>
      </form>

      <p className="muted">
        El listado de asesores se conectará a la API en la siguiente etapa.
      </p>

      <div className="cards">
        <article className="card">
          <h3>Perfil de asesor de ejemplo</h3>
          <p>Ing. Agrónomo — Nutrición y fertilización</p>
          <Link className="btn btn-outline" to="/asesores/1">
            Ver perfil
          </Link>
        </article>
      </div>
    </section>
  )
}

export default Advisors
