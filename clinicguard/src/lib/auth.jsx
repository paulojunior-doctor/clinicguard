import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [clinicaId, setClinicaId] = useState(null)
  const [popsSeeded, setPopsSeeded] = useState(false)
  const [loading, setLoading] = useState(true)

  const carregarPerfil = async (userId) => {
    try {
      const { data } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) {
        setPerfil(data)
        if (data.clinica_id) {
          setClinicaId(data.clinica_id)
          // Verificar se POPs já foram inseridos
          const { count } = await supabase
            .from('pops')
            .select('*', { count: 'exact', head: true })
            .eq('clinica_id', data.clinica_id)
          setPopsSeeded(count > 0)
        }
      }
      return data
    } catch {
      return null
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      if (session?.user) {
        setUser(session.user)
        await carregarPerfil(session.user.id)
      }
      setLoading(false)
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await carregarPerfil(session.user.id)
      } else {
        setUser(null)
        setPerfil(null)
        setClinicaId(null)
        setPopsSeeded(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return false
      await carregarPerfil(data.user.id)
      return true
    } catch {
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
    setClinicaId(null)
    setPopsSeeded(false)
  }

  const isSuperAdmin = perfil?.role === 'superadmin'

  return (
    <AuthContext.Provider value={{
      user, perfil, loading, login, logout,
      isSuperAdmin, clinicaId, popsSeeded, setPopsSeeded
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
