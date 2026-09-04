import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

const CLINICA_ID_KEY = 'clinicguard_clinica_id'
const POPS_SEEDED_KEY = 'pops_seeded'

// Evita que uma chamada travada ao Supabase prenda a tela para sempre.
// Se a promise não responder dentro do prazo, desiste e sinaliza erro
// em vez de deixar o app girando em "Carregando..." eternamente.
function comTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [clinicaId, setClinicaId] = useState(localStorage.getItem(CLINICA_ID_KEY))
  const [popsSeeded, setPopsSeededState] = useState(localStorage.getItem(POPS_SEEDED_KEY) === 'true')
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false) // true quando uma chamada travou/expirou

  const setPopsSeeded = (val) => {
    localStorage.setItem(POPS_SEEDED_KEY, val ? 'true' : 'false')
    setPopsSeededState(val)
  }

  const carregarPerfil = async (userId) => {
    try {
      setAuthError(false)
      const { data } = await comTimeout(
        supabase.from('perfis').select('*').eq('id', userId).single()
      )
      if (data) {
        setPerfil(data)
        if (data.clinica_id) {
          setClinicaId(data.clinica_id)
          localStorage.setItem(CLINICA_ID_KEY, data.clinica_id)
          // Verificar se POPs já foram inseridos (com o mesmo limite de segurança)
          try {
            const { count } = await comTimeout(
              supabase.from('pops').select('*', { count: 'exact', head: true }).eq('clinica_id', data.clinica_id)
            )
            const seeded = count > 0
            setPopsSeededState(seeded)
            localStorage.setItem(POPS_SEEDED_KEY, seeded ? 'true' : 'false')
          } catch {
            // Não bloqueia o carregamento do perfil se só essa parte travar
          }
        }
      }
      return data
    } catch {
      setAuthError(true)
      return null
    }
  }

  // Permite tentar de novo manualmente (usado por um botão "Tentar novamente")
  const retryAuth = async () => {
    if (!user) return
    setAuthError(false)
    await carregarPerfil(user.id)
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
        setPopsSeededState(false)
        localStorage.removeItem(CLINICA_ID_KEY)
        localStorage.removeItem(POPS_SEEDED_KEY)
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
    setPopsSeededState(false)
    localStorage.removeItem(CLINICA_ID_KEY)
    localStorage.removeItem(POPS_SEEDED_KEY)
  }

  const isSuperAdmin = perfil?.role === 'superadmin'

  return (
    <AuthContext.Provider value={{
      user, perfil, loading, login, logout,
      isSuperAdmin, clinicaId, popsSeeded, setPopsSeeded,
      authError, retryAuth
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)