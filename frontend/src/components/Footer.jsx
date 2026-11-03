import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-title">Chiapas de origen</p>
          <p className="footer-text">
            Plataforma que conecta a productores de plátano con profesionales de
            asesoría agronómica en Chiapas.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Navegación secundaria">
          <div className="footer-col">
            <p className="footer-heading">Explorar</p>
            <Link to="/especialidades">Especialidades</Link>
            <Link to="/asesores">Asesores</Link>
            <Link to="/precios">Precios y planes</Link>
          </div>
          <div className="footer-col">
            <p className="footer-heading">Cuenta</p>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Registrarse</Link>
            <Link to="/registro?rol=asesor">Ofrecer mis servicios</Link>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        Chiapas de origen — asesoría agronómica para el cultivo de plátano.
      </div>
    </footer>
  )
}

export default Footer
