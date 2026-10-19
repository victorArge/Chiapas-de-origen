import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Specialties from './pages/Specialties.jsx'
import Advisors from './pages/Advisors.jsx'
import AdvisorProfile from './pages/AdvisorProfile.jsx'
import RequestAdvisory from './pages/RequestAdvisory.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProducerPanel from './pages/ProducerPanel.jsx'
import AdvisorPanel from './pages/AdvisorPanel.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/especialidades" element={<Specialties />} />
          <Route path="/asesores" element={<Advisors />} />
          <Route path="/asesores/:id" element={<AdvisorProfile />} />
          <Route path="/asesores/:id/solicitar" element={<RequestAdvisory />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/panel/productor"
            element={
              <ProtectedRoute roles={['PRODUCER']}>
                <ProducerPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/asesor"
            element={
              <ProtectedRoute roles={['ADVISOR']}>
                <AdvisorPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
