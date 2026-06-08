import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Cadastro() {
  const [form, setForm] = useState({
    email: '',
    senha: '',
    nome: '',
    responsavel_tecnico: '',
    cro: '',
    cnpj: '',
    telefone: '',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const cadastrar = async () => {
    if (!form.email || !form.senha || !form.nome || !form.responsavel_tecnico) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    setErro('')

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    })

    if (authError) {
      setErro(authError.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // 2. Criar clínica
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .insert({
        nome: form.nome,
        responsavel_tecnico: form.responsavel_tecnico,
        cro: form.cro,
        cnpj: form.cnpj,
        telefone: form.telefone,
        email: form.email,
      })
      .select('id')
      .single()

    if (clinicaError) {
      setErro('Erro ao criar clínica. Contate o suporte.')
      setLoading(false)
      return
    }

    // 3. Criar perfil via função security definer (bypassa RLS)
    const { error: perfilError } = await supabase.rpc('criar_perfil', {
      p_user_id: userId,
      p_clinica_id: clinica.id,
      p_role: 'admin',
    })

    if (perfilError) {
      setErro('Erro ao configurar perfil. Contate o suporte.')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar conta no ClinicGuard</h1>
          <p className="text-sm text-gray-500 mt-1">Programa piloto — acesso gratuito por 3 meses</p>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Acesso</p>
            <div className="space-y-3">
              <div>
                <label className="label">E-mail *</label>
                <input className="input" type="email" placeholder="seu@email.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Senha *</label>
                <input className="input" type="password" placeholder="Mínimo 6 caracteres"
                  value={form.senha} onChange={e => set('senha', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dados da clínica</p>
            <div className="space-y-3">
              <div>
                <label className="label">Nome da clínica *</label>
                <input className="input" placeholder="Ex: Odontologia Dr. Silva"
                  value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>
              <div>
                <label className="label">Responsável Técnico (RT) *</label>
                <input className="input" placeholder="Dr. Nome Completo"
                  value={form.responsavel_tecnico} onChange={e => set('responsavel_tecnico', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CRO</label>
                  <input className="input" placeholder="12345-GO"
                    value={form.cro} onChange={e => set('cro', e.target.value)} />
                </div>
                <div>
                  <label className="label">CNPJ</label>
                  <input className="input" placeholder="00.000.000/0001-00"
                    value={form.cnpj} onChange={e => set('cnpj', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Telefone</label>
                <input className="input" placeholder="(62) 99999-9999"
                  value={form.telefone} onChange={e => set('telefone', e.target.value)} />
              </div>
            </div>
          </div>

          {erro && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {erro}
            </div>
          )}

          <button
            onClick={cadastrar}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><ArrowRight className="w-4 h-4" /> Criar conta e entrar</>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-600 hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
