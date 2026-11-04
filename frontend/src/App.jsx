import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import SubscriptionGate from './components/SubscriptionGate.jsx'
import Home from './pages/Home.jsx'
import Specialties from './pages/Specialties.jsx'
import Advisors from './pages/Advisors.jsx'
import AdvisorProfile from './pages/AdvisorProfile.jsx'
import RequestAdvisory from './pages/RequestAdvisory.jsx'
import Pricing from './pages/Pricing.jsx'
import Subscription from './pages/Subscription.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProducerPanel from './pages/ProducerPanel.jsx'
import AdvisorPanel from './pages/AdvisorPanel.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import Welcome from './pages/Welcome.jsx'
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
          <Route
            path="/asesores/:id/solicitar"
            element={
              <ProtectedRoute roles={['PRODUCER']}>
                <SubscriptionGate>
                  <RequestAdvisory />
                </SubscriptionGate>
              </ProtectedRoute>
            }
          />
          <Route path="/precios" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/suscripcion"
            element={
              <ProtectedRoute roles={['PRODUCER', 'ADVISOR']}>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suscripcion/pago"
            element={
              <ProtectedRoute roles={['PRODUCER', 'ADVISOR']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/productor"
            element={
              <ProtectedRoute roles={['PRODUCER']}>
                <SubscriptionGate>
                  <ProducerPanel />
                </SubscriptionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/asesor"
            element={
              <ProtectedRoute roles={['ADVISOR']}>
                <SubscriptionGate>
                  <AdvisorPanel />
                </SubscriptionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/panel/admin" replace />} />
          <Route
            path="/bienvenido"
            element={
              <ProtectedRoute roles={['PRODUCER', 'ADVISOR']}>
                <Welcome />
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
