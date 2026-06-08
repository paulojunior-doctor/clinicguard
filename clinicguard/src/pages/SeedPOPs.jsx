import { useState, useEffect } from 'react'
import { Shield, CheckCircle, Loader, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { popsBuccal } from '@/lib/popsBuccal'
import { CLINICA_ID_KEY } from '@/lib/useSupabase'

export default function SeedPOPs({ onComplete }) {
  const [status, setStatus] = useState('idle')
  const [progresso, setProgresso] = useState(0)
  const [total] = useState(popsBuccal.length)
  const [clinicaId, setClinicaId] = useState(null)
  const [nomeClinica, setNomeClinica] = useState('sua clínica')
  const [nomeRT, setNomeRT] = useState('o Responsável Técnico')

  useEffect(() => {
    const carregarClinica = async () => {
      // Primeiro tenta localStorage
      let id = localStorage.getItem(CLINICA_ID_KEY)

      // Se não tiver, busca do perfil autenticado
      if (!id) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: perfil } = await supabase
            .from('perfis')
            .select('clinica_id')
            .eq('id', user.id)
            .single()
          if (perfil?.clinica_id) {
            id = perfil.clinica_id
            localStorage.setItem(CLINICA_ID_KEY, id)
          }
        }
      }

      if (id) {
        setClinicaId(id)
        const { data: clinica } = await supabase
          .from('clinicas')
          .select('nome, responsavel_tecnico')
          .eq('id', id)
          .single()
        if (clinica) {
          setNomeClinica(clinica.nome)
          setNomeRT(clinica.responsavel_tecnico)
        }
      }
    }
    carregarClinica()
  }, [])

  const inserirPOPs = async () => {
    if (!clinicaId) {
      alert('Clínica não encontrada. Faça login novamente.')
      return
    }

    setStatus('loading')

    const { data: existentes } = await supabase
      .from('pops')
      .select('id')
      .eq('clinica_id', clinicaId)

    if (existentes && existentes.length > 0) {
      setStatus('done')
      setProgresso(existentes.length)
      onComplete && onComplete()
      return
    }

    let count = 0
    for (const pop of popsBuccal) {
      const { error } = await supabase
        .from('pops')
        .insert({
          ...pop,
          clinica_id: clinicaId,
          aprovado_por: nomeRT,
          aprovado_em: new Date().toISOString(),
        })

      if (!error) {
        count++
        setProgresso(count)
      }
      await new Promise(r => setTimeout(r, 100))
    }

    setStatus('done')
    setTimeout(() => {
      onComplete && onComplete()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">POPs da {nomeClinica}</h1>
          <p className="text-sm text-gray-500 mt-1">22 procedimentos completos prontos para uso</p>
        </div>

        <div className="card p-6">
          {status === 'idle' && (
            <>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Vamos inserir automaticamente os <strong>22 POPs obrigatórios</strong> para clínica odontológica conforme a <strong>RDC 1.002/2025</strong> da ANVISA, já com o nome da {nomeClinica} e {nomeRT} como RT.
              </p>
              <div className="bg-brand-50 rounded-lg p-3 mb-4 text-xs text-brand-700 space-y-1">
                <p>✓ Biossegurança (4 POPs)</p>
                <p>✓ Esterilização (6 POPs)</p>
                <p>✓ Higienização (3 POPs)</p>
                <p>✓ Resíduos (3 POPs)</p>
                <p>✓ Atendimento (3 POPs)</p>
                <p>✓ Administrativo (3 POPs)</p>
              </div>
              <button onClick={inserirPOPs} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                <FileText className="w-4 h-4" /> Inserir 22 POPs agora
              </button>
            </>
          )}

          {status === 'loading' && (
            <div className="text-center py-4">
              <Loader className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">Inserindo POPs no banco de dados...</p>
              <p className="text-sm text-gray-500 mt-1">{progresso} de {total}</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-brand-400 rounded-full transition-all"
                  style={{ width: `${(progresso / total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-900">POPs inseridos com sucesso!</p>
              <p className="text-sm text-gray-500 mt-1">{progresso} procedimentos disponíveis no sistema</p>
              <button onClick={() => onComplete && onComplete()} className="btn-primary mt-4 flex items-center justify-center gap-2 mx-auto">
                Ir para os POPs →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
