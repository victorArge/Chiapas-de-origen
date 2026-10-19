import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const panelPath = user?.role === 'ADVISOR' ? '/panel/asesor' : '/panel/productor'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        Chiapas de origen
      </Link>
      <nav className="site-nav">
        <NavLink to="/especialidades">Especialidades</NavLink>
        <NavLink to="/asesores">Asesores</NavLink>
        {user ? (
          <>
            <NavLink to={panelPath}>Mi panel</NavLink>
            <span className="nav-user">Hola, {user.name}</span>
            <button className="nav-button" type="button" onClick={handleLogout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Iniciar sesión</NavLink>
            <NavLink to="/registro">Registrarse</NavLink>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
