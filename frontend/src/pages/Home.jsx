import { Link } from 'react-router-dom'
import { specialties } from '../data/specialties.js'

function Home() {
  return (
    <>
      <section className="hero">
        <h1>Asesoría agronómica para productores de plátano</h1>
        <p>
          Conectamos a productores agrícolas con profesionales que ofrecen
          orientación técnica en el cultivo de plátano en Chiapas.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/asesores">
            Buscar asesores
          </Link>
          <Link className="btn btn-outline" to="/especialidades">
            Ver especialidades
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Especialidades</h2>
        <div className="cards">
          {specialties.map((specialty) => (
            <article className="card" key={specialty.slug}>
              <h3>{specialty.name}</h3>
              <p>{specialty.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
