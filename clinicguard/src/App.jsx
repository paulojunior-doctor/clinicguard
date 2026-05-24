import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import POPs from '@/pages/POPs'
import Treinamentos from '@/pages/Treinamentos'
import Obrigacoes from '@/pages/Obrigacoes'
import Documentos from '@/pages/Documentos'
import Fiscalizacao from '@/pages/Fiscalizacao'
import TourGuiado from '@/components/ui/TourGuiado'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  const [tourAtivo, setTourAtivo] = useState(true)

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
        </Route>
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="pops"         element={<POPs />} />
          <Route path="treinamentos" element={<Treinamentos />} />
          <Route path="obrigacoes"   element={<Obrigacoes />} />
          <Route path="documentos"   element={<Documentos />} />
          <Route path="fiscalizacao" element={<Fiscalizacao />} />
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
