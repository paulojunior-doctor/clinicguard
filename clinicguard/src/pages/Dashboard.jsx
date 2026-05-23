import { useNavigate } from 'react-router-dom'
import { ShieldAlert, FileText, GraduationCap, CheckSquare, FolderOpen, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { ScoreRing, StatusBadge } from '@/components/ui'
import { mockObrigacoes, mockPOPs, mockCiencias, mockColaboradores, formatDate } from '@/lib/mockData'

const alertasVencidos = mockObrigacoes.filter(o => o.status === 'vencido')
const alertasAlerta   = mockObrigacoes.filter(o => o.status === 'alerta')
const cienciasPendentes = mockColaboradores.filter(c =>
  !mockCiencias.find(ci => ci.colaboradorId === c.id && ci.assinado)
)

const metrics = [
  { label: 'POPs ativos',         value: mockPOPs.filter(p => p.status === 'ativo').length,  icon: FileText,      color: 'text-brand-600', bg: 'bg-brand-50' },
  { label: 'Ciências pendentes',  value: cienciasPendentes.length,                            icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Obrigações vencidas', value: alertasVencidos.length,                              icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50' },
  { label: 'Docs no cofre',       value: 5,                                                    icon: FolderOpen,    color: 'text-purple-600', bg: 'bg-purple-50' },
]

const scorePorCategoria = [
  { label: 'POPs e Procedimentos', pct: 92, color: 'bg-brand-400' },
  { label: 'Documentação',         pct: 80, color: 'bg-amber-400' },
  { label: 'Treinamentos',         pct: 74, color: 'bg-amber-400' },
  { label: 'Equipamentos',         pct: 95, color: 'bg-brand-400' },
  { label: 'Resíduos e Ambiente',  pct: 88, color: 'bg-brand-400' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Visão geral</h1>
          <p className="text-sm text-gray-500 mt-0.5">Odonto Central · Responsável Técnico: Dr. João Rocha</p>
        </div>
        <button
          onClick={() => navigate('/fiscalizacao')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <ShieldAlert className="w-4 h-4" />
          Modo Fiscalização
        </button>
      </div>

      {/* Score + Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Score Card */}
        <div className="card p-5 flex items-center gap-5">
          <ScoreRing score={87} size={88} />
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Score Sanitário</p>
            <p className="text-base font-semibold text-gray-900">Bom — 87/100</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">3 itens críticos pendentes. Resolva para atingir 95+.</p>
            <button
              onClick={() => navigate('/obrigacoes')}
              className="text-xs text-brand-600 font-medium mt-2 hover:underline"
            >
              Ver pendências →
            </button>
          </div>
        </div>

        {/* Métricas */}
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

      {/* Score por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Score por categoria</h2>
          </div>
          <div className="space-y-3">
            {scorePorCategoria.map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-900">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
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
          <div className="space-y-2.5">
            {[...alertasVencidos, ...alertasAlerta].slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'vencido' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <span className="text-sm text-gray-700 flex-1 truncate">{item.nome}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
            <button
              onClick={() => navigate('/obrigacoes')}
              className="text-xs text-brand-600 font-medium mt-1 hover:underline"
            >
              Ver todas as obrigações →
            </button>
          </div>
        </div>
      </div>

      {/* Atividade recente */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Atividade recente</h2>
        </div>
        <div className="space-y-3">
          {[
            { icon: CheckCircle, color: 'text-green-500', msg: 'Ana Melo assinou ciência do POP "Esterilização em Autoclave"', data: 'Hoje, 09:14' },
            { icon: FileText,    color: 'text-brand-500', msg: 'POP "Gestão de Resíduos" enviado para aprovação do RT',         data: 'Ontem, 16:30' },
            { icon: AlertTriangle, color: 'text-red-500', msg: 'Controle biológico da autoclave vencido há 2 dias',            data: '27/05, 08:00' },
            { icon: CheckCircle, color: 'text-green-500', msg: 'Documento "Alvará Sanitário 2024" adicionado ao cofre',        data: '25/05, 14:22' },
          ].map(({ icon: Icon, color, msg, data }, i) => (
            <div key={i} className="flex items-start gap-3">
              <Icon className={`w-4 h-4 ${color} mt-0.5 flex-shrink-0`} />
              <p className="text-sm text-gray-700 flex-1">{msg}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap">{data}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
