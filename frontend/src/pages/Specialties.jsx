import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import {
  PlantIcon,
  PestIcon,
  WaterIcon,
  NutritionIcon,
  ArrowIcon,
} from '../components/Icons.jsx'
import establecimientoImage from '../../../imagenes/Establecimiento.jpeg'
import plagasEnfermedadesImage from '../../../imagenes/plagas y enfermedades.jpeg'
import aguaRiegoImage from '../../../imagenes/Agua y riego.jpeg'
import nutricionFertilizacionImage from '../../../imagenes/Nutrición y fertilización.jpeg'
import BrandBanner from '../components/BrandBanner.jsx'

function normalizeKey(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function getSpecialtyImage(name) {
  const key = normalizeKey(name)
  const images = {
    'establecimiento de la plantacion': establecimientoImage,
    'control de plagas y enfermedades': plagasEnfermedadesImage,
    'gestion del agua y riego': aguaRiegoImage,
    'nutricion y fertilizacion': nutricionFertilizacionImage,
  }
  return images[key] || null
}

function getSpecialtyIcon(name) {
  const key = normalizeKey(name)
  const icons = {
    'establecimiento de la plantacion': PlantIcon,
    'control de plagas y enfermedades': PestIcon,
    'gestion del agua y riego': WaterIcon,
    'nutricion y fertilizacion': NutritionIcon,
  }
  return icons[key] || null
}

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
      <BrandBanner
        title="Catálogo de especialidades"
        description="Temas de asesoría agronómica para el cultivo de plátano en Chiapas."
        className="brand-banner-compact"
      />
      <h2>Catálogo de especialidades</h2>

      {status === 'loading' && <p className="muted">Cargando especialidades...</p>}
      {status === 'error' && (
        <p className="error">No se pudieron cargar las especialidades: {error}</p>
      )}

      {status === 'ready' && (
        <div className="cards">
          {specialties.map((specialty) => {
            const Icon = getSpecialtyIcon(specialty.name)
            const image = getSpecialtyImage(specialty.name)
            return (
              <article className="card specialty-card" key={specialty.id}>
                <div className="specialty-media">
                  {image && (
                    <img src={image} alt={specialty.name} loading="lazy" decoding="async" />
                  )}
                </div>
                <div className="specialty-body">
                  <span className="card-icon" aria-hidden="true">
                    {Icon && <Icon />}
                  </span>
                  <h3>{specialty.name}</h3>
                  <p>{specialty.description}</p>
                  <Link className="card-link" to="/asesores">
                    Consultar especialidad <ArrowIcon />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Specialties