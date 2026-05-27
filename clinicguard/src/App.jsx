import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import { CLINICA_ID_KEY } from '@/lib/useSupabase'
import Layout from '@/components/layout/Layout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'
import SeedPOPs from '@/pages/SeedPOPs'
import Dashboard from '@/pages/Dashboard'
import POPs from '@/pages/POPs'
import Colaboradores from '@/pages/Colaboradores'
import Treinamentos from '@/pages/Treinamentos'
import Obrigacoes from '@/pages/Obrigacoes'
import Documentos from '@/pages/Documentos'
import Fiscalizacao from '@/pages/Fiscalizacao'
import Assinar from '@/pages/Assinar'
import Manual from '@/pages/Manual'
import TourGuiado from '@/components/ui/TourGuiado'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  const [tourAtivo, setTourAtivo] = useState(true)
  const [clinicaId, setClinicaId] = useState(localStorage.getItem(CLINICA_ID_KEY))
  const [popsSeeded, setPopsSeeded] = useState(localStorage.getItem('pops_seeded') === 'true')

  if (user && !clinicaId) return <Setup onComplete={id => setClinicaId(id)} />
  if (user && clinicaId && !popsSeeded) return <SeedPOPs onComplete={() => { localStorage.setItem('pops_seeded','true'); setPopsSeeded(true) }} />

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/assinar" element={<Assinar />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="pops"          element={<POPs />} />
          <Route path="colaboradores" element={<Colaboradores />} />
          <Route path="treinamentos"  element={<Treinamentos />} />
          <Route path="obrigacoes"    element={<Obrigacoes />} />
          <Route path="documentos"    element={<Documentos />} />
          <Route path="fiscalizacao"  element={<Fiscalizacao />} />
          <Route path="manual"        element={<Manual />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {user && tourAtivo && <TourGuiado onClose={() => setTourAtivo(false)} />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
