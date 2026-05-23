import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function Login() {
  const [email, setEmail] = useState('joao@odocentral.com')
  const [senha, setSenha] = useState('123456')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(email, senha)
    setLoading(false)
    if (ok) navigate('/dashboard')
    else setErro('E-mail ou senha inválidos.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ClinicGuard</h1>
          <p className="text-sm text-gray-500 mt-1">Compliance Sanitário para Clínicas</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Entrar na plataforma</h2>
          <p className="text-xs text-gray-400 mb-5">Use as credenciais da sua clínica</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rt@suaclinica.com"
                required
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  className="input pr-10"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-brand-50 rounded-lg">
            <p className="text-xs text-brand-600 font-medium">Demo — acesso rápido:</p>
            <p className="text-xs text-brand-600">Email: joao@odocentral.com</p>
            <p className="text-xs text-brand-600">Senha: 123456</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 ClinicGuard · Compliance Sanitário
        </p>
      </div>
    </div>
  )
}
