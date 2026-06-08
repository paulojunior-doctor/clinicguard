import { useNavigate } from 'react-router-dom'
import { ShieldAlert, FileText, GraduationCap, CheckSquare, FolderOpen, TrendingUp, AlertTriangle, CheckCircle, Clock, Loader, Users } from 'lucide-react'
import { ScoreRing } from '@/components/ui'
import { usePOPs, useCiencias, useObrigacoes, useDocumentos, useColaboradores, useClinicaId, useClinica } from '@/lib/useSupabase'
import { formatDate } from '@/lib/mockData'

export default function Dashboard() {
  const navigate    = useNavigate()
  const clinicaId   = useClinicaId()
  const clinica     = useClinica(clinicaId)

  const { pops,          loading: l1 } = usePOPs(clinicaId)
  const { ciencias,      loading: l2 } = useCiencias(clinicaId)
  const { obrigacoes,    loading: l3 } = useObrigacoes(clinicaId)
  const { documentos,    loading: l4 } = useDocumentos(clinicaId)
  const { colaboradores, loading: l5 } = useColaboradores(clinicaId)

  const loading = l1 || l2 || l3 || l4 || l5

  // Métricas reais
  const popsAtivos      = pops.filter(p => p.status === 'ativo').length
  const cienciasPend    = ciencias.filter(c => !c.assinado).length
  const obrigVencidas   = obrigacoes.filter(o => o.status === 'vencido').length
  const totalDocs       = documentos.length

  // Score sanitário calculado
  const calcScore = () => {
    if (pops.length === 0) return 0
    let score = 100
    score -= obrigacoes.filter(o => o.status === 'vencido').length * 10
    score -= obrigacoes.filter(o => o.status === 'alerta').length * 3
    if (ciencias.length > 0) {
      const pctAssinado = ciencias.filter(c => c.assinado).length / ciencias.length
      score -= Math.round((1 - pctAssinado) * 15)
    }
    return Math.max(0, Math.min(100, score))
  }
  const score = calcScore()

  // Score por categoria
  const scoreCateg = [
    { label: 'POPs e Procedimentos', pct: pops.length > 0 ? Math.round((pops.filter(p => p.status === 'ativo').length / pops.length) * 100) : 0, color: 'bg-brand-400' },
    { label: 'Documentação',         pct: documentos.length > 0 ? Math.round((documentos.filter(d => d.status === 'ok').length / documentos.length) * 100) : 0, color: 'bg-amber-400' },
    { label: 'Treinamentos',         pct: ciencias.length > 0 ? Math.round((ciencias.filter(c => c.assinado).length / ciencias.length) * 100) : 0, color: 'bg-amber-400' },
    { label: 'Obrigações Sanitárias', pct: obrigacoes.length > 0 ? Math.round((obrigacoes.filter(o => o.status === 'ok').length / obrigacoes.length) * 100) : 0, color: 'bg-brand-400' },
  ]

  const alertas = obrigacoes.filter(o => o.status === 'vencido' || o.status === 'alerta').slice(0, 5)

  const metrics = [
    { label: 'POPs ativos',         value: popsAtivos,    icon: FileText,      color: 'text-brand-600',  bg: 'bg-brand-50' },
    { label: 'Ciências pendentes',  value: cienciasPend,  icon: GraduationCap, color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Obrigações vencidas', value: obrigVencidas, icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50' },
    { label: 'Docs no cofre',       value: totalDocs,     icon: FolderOpen,    color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const scoreLabel = score >= 90 ? 'Excelente' : score >= 75 ? 'Bom' : score >= 60 ? 'Regular' : 'Crítico'

 if (!clinicaId) return (
  <div className="p-6 flex items-center justify-center min-h-96 gap-2 text-gray-400">
    <Loader className="w-5 h-5 animate-spin" /> Carregando...
  </div>
)

if (loading) return (
  <div className="p-6 flex items-center justify-center min-h-96 gap-2 text-gray-400">
    <Loader className="w-5 h-5 animate-spin" /> Carregando...
  </div>
)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Visão geral</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {clinica?.nome} · Responsável Técnico: {clinica?.responsavel_tecnico}
          </p>
        </div>
        <button onClick={() => navigate('/fiscalizacao')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <ShieldAlert className="w-4 h-4" /> Modo Fiscalização
        </button>
      </div>

      {/* Score + Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="card p-5 flex items-center gap-5">
          <ScoreRing score={score} size={88} />
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Score Sanitário</p>
            <p className="text-base font-semibold text-gray-900">{scoreLabel} — {score}/100</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {obrigVencidas > 0 ? `${obrigVencidas} obrigação(ões) vencida(s).` : cienciasPend > 0 ? `${cienciasPend} ciência(s) pendente(s).` : 'Tudo em dia! ✓'}
            </p>
            <button onClick={() => navigate('/obrigacoes')} className="text-xs text-brand-600 font-medium mt-2 hover:underline">
              Ver pendências →
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Score por categoria */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Score por categoria</h2>
          </div>
          <div className="space-y-3">
            {scoreCateg.map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-900">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${pct >= 80 ? 'bg-brand-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Alertas ativos</h2>
          </div>
          {alertas.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 py-4">
              <CheckCircle className="w-4 h-4" /> Todas as obrigações em dia!
            </div>
          ) : (
            <div className="space-y-2.5">
              {alertas.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'vencido' ? 'bg-red-500' : 'bg-amber-400'}`} />
                  <span className="text-sm text-gray-700 flex-1 truncate">{item.nome}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'vencido' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    {item.status === 'vencido' ? 'Vencido' : 'Alerta'}
                  </span>
                </div>
              ))}
              <button onClick={() => navigate('/obrigacoes')} className="text-xs text-brand-600 font-medium mt-1 hover:underline">
                Ver todas as obrigações →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Resumo da equipe</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Colaboradores', value: colaboradores.length, color: 'text-gray-900' },
            { label: 'Ciências assinadas', value: ciencias.filter(c => c.assinado).length, color: 'text-green-600' },
            { label: 'Ciências pendentes', value: cienciasPend, color: cienciasPend > 0 ? 'text-red-600' : 'text-gray-900' },
            { label: 'POPs enviados', value: [...new Set(ciencias.map(c => c.pop_id))].length, color: 'text-brand-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
