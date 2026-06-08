import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
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
import EstruturaSalas from '@/pages/EstruturaSalas'
import SuperAdmin from '@/pages/SuperAdmin'
import TourGuiado from '@/components/ui/TourGuiado'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, isSuperAdmin, clinicaId, popsSeeded, setPopsSeeded } = useAuth()
  const [tourAtivo, setTourAtivo] = useState(true)

  if (user &&
