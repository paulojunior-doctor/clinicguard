import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (email, password) => {
    // Mock: qualquer email/senha válidos funcionam
    if (email && password.length >= 4) {
      setUser({ email, nome: 'Dr. João Rocha', clinica: 'Odonto Central', role: 'rt' })
      return true
    }
    return false
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
