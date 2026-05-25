import { useState } from 'react'
import { Plus, AlertTriangle, CheckCircle, Clock, Upload, Loader } from 'lucide-react'
import { PageHeader, StatusBadge, Modal, EmptyState } from '@/components/ui'
import { useObrigacoes, useClinicaId } from '@/lib/useSupabase'

const categorias = ['Todas', 'Esterilização', 'Manutenção', 'Controle de Pragas', 'Licença', 'Medicina do Trabalho', 'Imunização', 'Resíduos']
const periodicidades = ['Semanal', 'Quinzenal', 'Mensal', 'Trimestral', 'Semestral', 'Anual', 'Conforme esquema']

const templates = [
  { nome: 'Controle Biológico Autoclave',        categoria: 'Esterilização',        periodicidade: 'Semanal',          responsavel: 'Auxiliar de Saúde Bucal' },
  { nome: 'Manutenção Preventiva Autoclave',      categoria: 'Esterilização',        periodicidade: 'Semestral',        responsavel: 'Empresa Técnica' },
  { nome: 'Calibração da Autoclave',              categoria: 'Esterilização',        periodicidade: 'Anual',            responsavel: 'Empresa Técnica' },
  { nome: 'Controle de Temperatura Diário',       categoria: 'Esterilização',        periodicidade: 'Semanal',          responsavel: 'Auxiliar de Saúde Bucal' },
  { nome: 'PMOC — Manutenção Ar-Condicionado',    categoria: 'Manutenção',           periodicidade: 'Semestral',        responsavel: 'Empresa de Climatização' },
  { nome: 'Limpeza Filtros Ar-Condicionado',      categoria: 'Manutenção',           periodicidade: 'Mensal',           responsavel: 'Auxiliar' },
  { nome: 'Manutenção Cadeira Odontológica',      categoria: 'Manutenção',           periodicidade: 'Anual',            responsavel: 'Empresa Técnica' },
  { nome: 'Calibração Fotopolimerizador',         categoria: 'Manutenção',           periodicidade: 'Mensal',           responsavel: 'Auxiliar de Saúde Bucal' },
  { nome: 'Calibração Equipamento de RX',         categoria: 'Manutenção',           periodicidade: 'Anual',            responsavel: 'Empresa Técnica' },
  { nome: 'Dedetização / Controle de Pragas',     categoria: 'Controle de Pragas',   periodicidade: 'Semestral',        responsavel: 'Empresa Licenciada' },
  { nome: 'Alvará Sanitário',                     categoria: 'Licença',              periodicidade: 'Anual',            responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'Alvará de Funcionamento (Prefeitura)', categoria: 'Licença',              periodicidade: 'Anual',            responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'Licença Ambiental',                    categoria: 'Licença',              periodicidade: 'Anual',            responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'ASO — Atestado de Saúde Ocupacional',  categoria: 'Medicina do Trabalho', periodicidade: 'Anual',            responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'PCMSO — Programa de Saúde',            categoria: 'Medicina do Trabalho', periodicidade: 'Anual',            responsavel: 'Médico do Trabalho' },
  { nome: 'PPRA / PGR — Programa de Riscos',      categoria: 'Medicina do Trabalho', periodicidade: 'Anual',            responsavel: 'Técnico de Segurança' },
  { nome: 'Vacina Hepatite B — Equipe',            categoria: 'Imunização',           periodicidade: 'Conforme esquema', responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'Vacina Tríplice Viral — Equipe',        categoria: 'Imunização',           periodicidade: 'Conforme esquema', responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'Manifesto de Resíduos (MTR)',           categoria: 'Resíduos',             periodicidade: 'Mensal',           responsavel: 'Empresa Coletora' },
  { nome: 'Contrato Empresa Coleta de Resíduos',  categoria: 'Resíduos',             periodicidade: 'Anual',            responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'PGRSS — Plano de Gerenciamento',       categoria: 'Resíduos',             periodicidade: 'Anual',            responsavel: 'Dr. Paulo Vieira Junior' },
  { nome: 'Separador de Amalgama — Manutenção',   categoria: 'Manutenção',           periodicidade: 'Semestral',        responsavel: 'Empresa Técnica' },
]

const StatusIcon = ({ status }) => {
  if (status === 'ok')      return <CheckCircle className="w-5 h-5 text-green-500" />
  if (status === 'alerta')  return <Clock className="w-5 h-5 text-amber-500" />
  if (status === 'vencido') return <AlertTriangle className="w-5 h-5 text-red-500" />
  return null
}

function calcStatus(dataStr) {
  if (!dataStr) return 'alerta'
  const hoje = new Date()
  const data = new Date(dataStr)
  const diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'vencido'
  if (diff <= 30) return 'alerta'
  return 'ok'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export default function Obrigacoes() {
  const clinicaId = useClinicaId()
  const { obrigacoes, loading, criar, registrar } = useObrigacoes(clinicaId)

  const [filtro, setFiltro]             = useState('Todas')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [modalNova, setModalNova]       = useState(false)
  const [modalReg, setModalReg]         = useState(null)
  const [salvando, setSalvando]         = useState(false)
  const [registrando, setRegistrando]   = useState(false)
  const [nova, setNova] = useState({ nome: '', categoria: 'Manutenção', periodicidade: 'Anual', responsavel: '', proxima_data: '' })

  const aplicarTemplate = (t) => {
    setNova({ ...nova, nome: t.nome, categoria: t.categoria, periodicidade: t.periodicidade, responsavel: t.responsavel })
  }

  const filtradas = obrigacoes.filter(o => {
    const catOk    = filtro === 'Todas' || o.categoria === filtro
    const status   = calcStatus(o.proxima_data)
    const statusOk = filtroStatus === 'Todos' || status === filtroStatus
    return catOk && statusOk
  })

  const contadores = {
    ok:      obrigacoes.filter(o => calcStatus(o.proxima_data) === 'ok').length,
    alerta:  obrigacoes.filter(o => calcStatus(o.proxima_data) === 'alerta').length,
    vencido: obrigacoes.filter(o => calcStatus(o.proxima_data) === 'vencido').length,
  }

  const adicionarObrigacao = async () => {
    if (!nova.nome.trim()) return
    setSalvando(true)
    await criar({ ...nova, status: calcStatus(nova.proxima_data), ultima_data: null })
    setSalvando(false)
    setModalNova(false)
    setNova({ nome: '', categoria: 'Manutenção', periodicidade: 'Anual', responsavel: '', proxima_data: '' })
  }

  const registrarCumprimento = async () => {
    setRegistrando(true)
    await registrar(modalReg.id)
    setRegistrando(false)
    setModalReg(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Obrigações Sanitárias"
        subtitle="Semáforo de conformidade regulatória"
        action={
          <button onClick={() => setModalNova(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova obrigação
          </button>
        }
      />

      {/* Semáforo */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Em dia',  value: contadores.ok,      status: 'ok',      bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: CheckCircle },
          { label: 'Atenção', value: contadores.alerta,  status: 'alerta',  bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: Clock },
          { label: 'Vencido', value: contadores.vencido, status: 'vencido', bg: 'bg-red-50',   border: 'border-red-100',   text: 'text-red-700',   icon: AlertTriangle },
        ].map(({ label, value, status, bg, border, text, icon: Icon }) => (
          <button key={status}
            onClick={() => setFiltroStatus(filtroStatus === status ? 'Todos' : status)}
            className={`card p-4 text-center border cursor-pointer transition-all ${filtroStatus === status ? `${bg} ${border}` : 'hover:bg-gray-50'}`}>
            <Icon className={`w-6 h-6 mx-auto mb-1 ${filtroStatus === status ? text : 'text-gray-300'}`} />
            <p className={`text-2xl font-bold ${filtroStatus === status ? text : 'text-gray-900'}`}>{value}</p>
            <p className={`text-xs mt-0.5 ${filtroStatus === status ? text : 'text-gray-500'}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categorias.map(c => (
          <button key={c} onClick={() => setFiltro(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtro === c ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <Loader className="w-4 h-4 animate-spin" /> Carregando obrigações...
          </div>
        ) : filtradas.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title={obrigacoes.length === 0 ? 'Nenhuma obrigação cadastrada' : 'Nenhuma obrigação encontrada'}
            desc={obrigacoes.length === 0 ? 'Cadastre as obrigações sanitárias da Buccal para monitorar os vencimentos.' : 'Tente mudar o filtro.'}
            action={obrigacoes.length === 0 && <button onClick={() => setModalNova(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Cadastrar primeira</button>}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtradas.map(item => {
              const status = calcStatus(item.proxima_data)
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <StatusIcon status={status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{item.categoria}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{item.periodicidade}</span>
                      {item.responsavel && <><span className="text-xs text-gray-300">·</span><span className="text-xs text-gray-400">Resp: {item.responsavel}</span></>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Próximo venc.</p>
                    <p className={`text-sm font-medium ${status === 'vencido' ? 'text-red-600' : status === 'alerta' ? 'text-amber-600' : 'text-gray-900'}`}>
                      {formatDate(item.proxima_data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={status} />
                    <button onClick={() => setModalReg(item)}
                      className="text-xs text-brand-600 font-medium bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                      Registrar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Nova Obrigação */}
      <Modal open={modalNova} onClose={() => setModalNova(false)} title="Nova obrigação sanitária"
        footer={
          <>
            <button onClick={() => setModalNova(false)} className="btn-secondary">Cancelar</button>
            <button onClick={adicionarObrigacao} disabled={salvando || !nova.nome.trim()} className="btn-primary flex items-center gap-2">
              {salvando ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Adicionar</>}
            </button>
          </>
        }>
        <div className="space-y-4">
          {/* Templates */}
          <div>
            <label className="label">Escolha um template ou preencha manualmente</label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-2">
              {templates.map(t => (
                <button key={t.nome} onClick={() => aplicarTemplate(t)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${nova.nome === t.nome ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <span className="font-medium">{t.nome}</span>
                  <span className="text-gray-400 ml-2">· {t.categoria} · {t.periodicidade}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 mb-3">Ou edite os campos abaixo:</p>
            <div className="space-y-3">
              <div>
                <label className="label">Nome da obrigação *</label>
                <input className="input" placeholder="Ex: Controle Biológico Autoclave" value={nova.nome} onChange={e => setNova({...nova, nome: e.target.value})} />
              </div>
              <div>
                <label className="label">Responsável</label>
                <input className="input" placeholder="Nome do responsável" value={nova.responsavel} onChange={e => setNova({...nova, responsavel: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Categoria</label>
                  <select className="input" value={nova.categoria} onChange={e => setNova({...nova, categoria: e.target.value})}>
                    {categorias.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Periodicidade</label>
                  <select className="input" value={nova.periodicidade} onChange={e => setNova({...nova, periodicidade: e.target.value})}>
                    {periodicidades.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Próximo vencimento</label>
                <input type="date" className="input" value={nova.proxima_data} onChange={e => setNova({...nova, proxima_data: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Registrar */}
      <Modal open={!!modalReg} onClose={() => setModalReg(null)} title="Registrar cumprimento"
        footer={
          <>
            <button onClick={() => setModalReg(null)} className="btn-secondary">Cancelar</button>
            <button onClick={registrarCumprimento} disabled={registrando} className="btn-primary flex items-center gap-2">
              {registrando ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" />Confirmar</>}
            </button>
          </>
        }>
        {modalReg && (
          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Obrigação</p>
              <p className="font-medium text-gray-900">{modalReg.nome}</p>
            </div>
            <div>
              <label className="label">Data de execução</label>
              <input type="date" className="input" defaultValue={new Date().toISOString().slice(0,10)} />
            </div>
            <div>
              <label className="label">Empresa/profissional executante</label>
              <input className="input" placeholder="Nome da empresa ou profissional" />
            </div>
            <div>
              <label className="label">Observações</label>
              <textarea className="input h-20 resize-none" placeholder="Observações sobre a execução..." />
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-brand-300 transition-colors">
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Anexar comprovante (PDF, imagem)</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
