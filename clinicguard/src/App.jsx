import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import POPs from '@/pages/POPs'
import Treinamentos from '@/pages/Treinamentos'
import Obrigacoes from '@/pages/Obrigacoes'
import Documentos from '@/pages/Documentos'
import Fiscalizacao from '@/pages/Fiscalizacao'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="pops"         element={<POPs />} />
        <Route path="treinamentos" element={<Treinamentos />} />
        <Route path="obrigacoes"   element={<Obrigacoes />} />
        <Route path="documentos"   element={<Documentos />} />
        <Route path="fiscalizacao" element={<Fiscalizacao />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
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
