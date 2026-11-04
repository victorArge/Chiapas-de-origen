import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { specialties } from '../data/specialties.js'
import { useAdvisoryTypes } from '../hooks/useAdvisoryTypes.js'
import { usePlans } from '../hooks/usePlans.js'
import { useAuth } from '../hooks/useAuth.js'
import { useSubscription } from '../hooks/useSubscription.js'
import { formatCurrency } from '../utils/format.js'
import {
  PlantIcon,
  PestIcon,
  WaterIcon,
  NutritionIcon,
  SearchIcon,
  ArrowIcon,
  RequestIcon,
  AdviceIcon,
  CheckIcon,
  LockIcon,
} from '../components/Icons.jsx'

const encuentraAsesor = '/images/encuentra un asesor.jpeg'
const bienvenidaImg = '/images/BienvenidosaChiapasdeOrigen.png'

const SPECIALTY_ICONS = {
  establecimiento: PlantIcon,
  'plagas-enfermedades': PestIcon,
  'agua-riego': WaterIcon,
  'nutricion-fertilizacion': NutritionIcon,
}

const STEPS = [
  {
    icon: SearchIcon,
    title: 'Encuentra un asesor',
    text: 'Busca por especialidad, estado o municipio y revisa los perfiles de los profesionales disponibles.',
  },
  {
    icon: RequestIcon,
    title: 'Envía una solicitud',
    text: 'Cuéntale tu necesidad y los detalles de tu plantación al asesor que elijas.',
  },
  {
    icon: AdviceIcon,
    title: 'Recibe orientación',
    text: 'El asesor revisa tu solicitud y te contacta para acompañarte técnicamente.',
  },
]

function Home() {
  const navigate = useNavigate()
  const types = useAdvisoryTypes()
  const { items: plans, trialDays, notice } = usePlans()
  const { user } = useAuth()
  const { subscription, loading: subscriptionLoading } = useSubscription()
  const [search, setSearch] = useState({ specialty: '', state: '', municipality: '' })

  const advisorAccessResolved = !subscriptionLoading
  const advisorCanAccessCatalog =
    advisorAccessResolved &&
    user?.role === 'PRODUCER' &&
    Boolean(subscription?.isActive) &&
    !subscription?.isTrial

  const advisorSectionVisible =
    user?.role !== 'ADVISOR' && user?.role !== 'ADMIN'

  const advisorCatalogLocked = !advisorCanAccessCatalog && advisorSectionVisible

  const handleSearchChange = (event) => {
    const { name, value } = event.target
    setSearch((current) => ({ ...current, [name]: value }))
  }

  function handleSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    Object.entries(search).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim())
    })
    const query = params.toString()
    navigate(query ? `/asesores?${query}` : '/asesores')
  }

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src={bienvenidaImg} alt="Planta de plátano con hojas verdes en las laderas de Chiapas" />
        </div>
        <div className="hero-content">
          <p className="eyebrow">Asesoría agronómica en Chiapas</p>
          <h1>Asesoría agronómica para productores de plátano</h1>
          <p className="hero-lead">
            Conectamos a productores agrícolas con profesionales que ofrecen
            orientación técnica para el cultivo de plátano en Chiapas.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/asesores">
              Encuentra un asesor
            </Link>
            <Link className="btn btn-outline" to="/especialidades">
              Conoce nuestras especialidades
            </Link>
          </div>
          <ul className="hero-points">
            <li>
              <CheckIcon /> Asesores por especialidad
            </li>
            <li>
              <CheckIcon /> Contacto directo por solicitud
            </li>
            <li>
              <CheckIcon /> Orientación para tu cultivo
            </li>
          </ul>
        </div>
      </section>

      <section className="section intro-section">
        <header className="section-head">
          <p className="eyebrow">Chiapas de origen</p>
          <h2>El plátano de Chiapas con el respaldo de una asesoría profesional</h2>
          <p className="section-sub">
            Chiapas de origen conecta a productores agrícolas con profesionales
            de la asesoría agronómica para que el cultivo de plátano reciba el
            acompañamiento que necesita.
          </p>
        </header>
        <div className="intro-panel">
          <p>
            No todos los productores cuentan con un especialista al lado. Por eso
            la plataforma existe: para que la orientación técnica llegue a las
            fincas con el conocimiento del cultivo de plátano, la región y las
            condiciones locales.
          </p>
        </div>
      </section>

      <section className="section" id="especialidades">
        <header className="section-head">
          <p className="eyebrow">Especialidades</p>
          <h2>Temas en los que podemos orientarte</h2>
          <p className="section-sub">
            Los asesores se organizan por especialidad para que encuentres la
            orientación que tu plantación necesita.
          </p>
        </header>

        <div className="cards">
          {specialties.map((specialty) => {
            const Icon = SPECIALTY_ICONS[specialty.slug]
            return (
              <article className="card specialty-card" key={specialty.slug}>
                <div className="specialty-media">
                  <img
                    src={specialty.image}
                    alt={specialty.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="specialty-body">
                  <span className="card-icon" aria-hidden="true">
                    {Icon && <Icon />}
                  </span>
                  <h3>{specialty.name}</h3>
                  <p>{specialty.blurb}</p>
                  <Link className="card-link" to="/asesores">
                    Consultar especialidad <ArrowIcon />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section advisor-section">
        <div className="advisor-grid">
          <div className="advisor-copy">
            <p className="eyebrow">Encuentra un asesor</p>
            <h2>Encuentra al especialista que tu cultivo necesita</h2>
            <p>
              Conecta con profesionales especializados en el cultivo de plátano y
              recibe orientación técnica para mejorar la salud y productividad de tu
              plantación.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/asesores">
                Buscar asesores
              </Link>
              <Link className="btn btn-outline" to="/especialidades">
                Conoce nuestras especialidades
              </Link>
            </div>
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
          <div className="advisor-lock">
            <span className="advisor-lock-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <h3>Desbloquea el acceso a nuestros asesores</h3>
            <p>
              Suscríbete para encontrar profesionales especializados en el cultivo
              de plátano, consultar sus perfiles y solicitar asesoría técnica.
            </p>
            <p className="advisor-lock-message">Contenido exclusivo para agricultores suscritos</p>
            {user?.role === 'PRODUCER' && subscription?.status === 'EXPIRED' ? (
              <Link className="btn btn-primary" to="/suscripcion">
                Renovar suscripción
              </Link>
            ) : user ? (
              <>
                <p className="advisor-lock-price">$300 MXN</p>
                <p className="advisor-lock-duration">30 días</p>
                <Link className="btn btn-primary" to="/suscripcion">
                  Suscribirte para tener acceso a este menú
                </Link>
              </>
            ) : (
              <div className="advisor-lock-actions">
                <Link className="btn btn-outline" to="/login">
                  Iniciar sesión
                </Link>
                <Link className="btn btn-outline" to="/registro?rol=productor">
                  Registrarme
                </Link>
              </div>
            )}
          </div>
        ) : (
          advisorCanAccessCatalog && (
            <div className="advisor-search">
              <form className="search-box" onSubmit={handleSearch}>
                <label className="field">
                  <span>Especialidad</span>
                  <select name="specialty" value={search.specialty} onChange={handleSearchChange}>
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
                  <input
                    name="state"
                    value={search.state}
                    onChange={handleSearchChange}
                    placeholder="Ej. Chiapas"
                  />
                </label>

                <label className="field">
                  <span>Municipio</span>
                  <input
                    name="municipality"
                    value={search.municipality}
                    onChange={handleSearchChange}
                    placeholder="Ej. Tapachula"
                  />
                </label>

                <button className="btn btn-primary search-submit" type="submit">
                  <SearchIcon /> Buscar
                </button>
              </form>
            </div>
          )
        )}
      </section>

      <section className="section">
        <header className="section-head">
          <p className="eyebrow">Beneficios</p>
          <h2>Beneficios de la plataforma</h2>
          <p className="section-sub">
            Una vía clara y profesional para que el plátano reciba la atención que
            requiere en cada etapa.
          </p>
        </header>

        <ol className="steps">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li className="step" key={step.title}>
                <span className="step-top">
                  <span className="step-num">{index + 1}</span>
                  <span className="step-icon" aria-hidden="true">
                    <Icon />
                  </span>
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            )
          })}
        </ol>
      </section>

      {plans.length > 0 && (
        <section className="section">
          <header className="section-head">
            <p className="eyebrow">Planes</p>
            <h2>Suscripciones mensuales en MXN</h2>
            <p className="section-sub">
              Cada cuenta nueva incluye {trialDays} días de prueba.
            </p>
          </header>

          <div className="pricing-grid pricing-grid-compact">
            {plans.map((plan) => (
              <article className="pricing-card" key={plan.code}>
                <p className="eyebrow">
                  {plan.role === 'PRODUCER' ? 'Productores' : 'Asesores'}
                </p>
                <h3>{plan.name}</h3>
                <p className="pricing-price">
                  {formatCurrency(plan.priceMxn, plan.currency)}
                  <span> MXN / mes</span>
                </p>
                <p className="muted">{plan.description}</p>
                <Link className="btn btn-outline" to="/precios">
                  Ver plan
                </Link>
              </article>
            ))}
          </div>

          {notice && <p className="demo-note">{notice}</p>}
        </section>
      )}

      <section className="pro-section">
        <div className="pro-inner">
          <div className="pro-copy">
            <p className="eyebrow">Para profesionales</p>
            <h2>¿Eres agrónomo o especialista en plátano?</h2>
            <p>
              Registra tu perfil, indica tus especialidades y la zona donde
              trabajas para recibir solicitudes de productores de plátano en
              Chiapas.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/registro?rol=asesor">
                Registrarme como asesor
              </Link>
              <Link className="btn btn-outline" to="/especialidades">
                Ver especialidades
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home