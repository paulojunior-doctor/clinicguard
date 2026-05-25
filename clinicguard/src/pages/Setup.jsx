import { useState } from 'react'
import { Shield, ArrowRight, Building2 } from 'lucide-react'
import { getOrCreateClinica, CLINICA_ID_KEY } from '@/lib/useSupabase'

export default function Setup({ onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: 'Buccal Odontologia',
    responsavel_tecnico: 'Dr. Paulo Vieira Junior',
    cro: '',
    cnpj: '24.343.999/0001-30',
    email: '',
    telefone: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const salvar = async () => {
    if (!form.nome || !form.responsavel_tecnico) return
    setLoading(true)
    const id = await getOrCreateClinica(form.nome, form.responsavel_tecnico)

    // Salvar dados extras
    if (id) {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('clinicas').update({
        cro: form.cro,
        cnpj: form.cnpj,
        email: form.email,
        telefone: form.telefone,
      }).eq('id', id)
    }

    setLoading(false)
    onComplete(id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configure sua clínica</h1>
          <p className="text-sm text-gray-500 mt-1">Seus dados reais, salvos no banco de dados</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">Dados da clínica</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Nome da clínica *</label>
              <input className="input" placeholder="Ex: Odontologia Dr. Paulo" value={form.nome} onChange={e => set('nome', e.target.value)} />
            </div>
            <div>
              <label className="label">Responsável Técnico (RT) *</label>
              <input className="input" placeholder="Dr. Paulo Vieira Junior" value={form.responsavel_tecnico} onChange={e => set('responsavel_tecnico', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">CRO</label>
                <input className="input" placeholder="12345-SP" value={form.cro} onChange={e => set('cro', e.target.value)} />
              </div>
              <div>
                <label className="label">CNPJ</label>
                <input className="input" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={e => set('cnpj', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" placeholder="contato@suaclinica.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" placeholder="(62) 99999-9999" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
            </div>
          </div>

          <button
            onClick={salvar}
            disabled={loading || !form.nome || !form.responsavel_tecnico}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><ArrowRight className="w-4 h-4" /> Salvar e entrar no sistema</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
