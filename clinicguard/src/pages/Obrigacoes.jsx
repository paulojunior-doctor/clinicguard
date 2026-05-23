import { useState } from 'react'
import { Plus, AlertTriangle, CheckCircle, Clock, Upload, Filter } from 'lucide-react'
import { PageHeader, StatusBadge, Modal } from '@/components/ui'
import { mockObrigacoes, formatDate } from '@/lib/mockData'

const categorias = ['Todas', 'Esterilização', 'Manutenção', 'Controle de Pragas', 'Licença', 'Medicina do Trabalho', 'Imunização', 'Resíduos']

const StatusIcon = ({ status }) => {
  if (status === 'ok')      return <CheckCircle className="w-5 h-5 text-green-500" />
  if (status === 'alerta')  return <Clock className="w-5 h-5 text-amber-500" />
  if (status === 'vencido') return <AlertTriangle className="w-5 h-5 text-red-500" />
  return null
}

export default function Obrigacoes() {
  const [obrigacoes, setObrigacoes] = useState(mockObrigacoes)
  const [filtro, setFiltro] = useState('Todas')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [modalNova, setModalNova] = useState(false)
  const [modalReg, setModalReg] = useState(null)
  const [nova, setNova] = useState({ nome: '', categoria: 'Manutenção', periodicidade: 'Anual', responsavel: '' })

  const filtradas = obrigacoes.filter(o => {
    const catOk = filtro === 'Todas' || o.categoria === filtro
    const statusOk = filtroStatus === 'Todos' || o.status === filtroStatus
    return catOk && statusOk
  })

  const registrar = () => {
    setObrigacoes(obrigacoes.map(o =>
      o.id === modalReg?.id
        ? {
            ...o,
            status: 'ok',
            ultimaData: new Date().toISOString().slice(0,10),
            proximaData: new Date(Date.now() + 180*24*60*60*1000).toISOString().slice(0,10)
          }
        : o
    ))
    setModalReg(null)
  }

  const adicionarObrigacao = () => {
    if (!nova.nome.trim()) return
    setObrigacoes([...obrigacoes, {
      id: obrigacoes.length + 1,
      ...nova,
      ultimaData: null,
      proximaData: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0,10),
      status: 'alerta',
      documento: null
    }])
    setModalNova(false)
    setNova({ nome: '', categoria: 'Manutenção', periodicidade: 'Anual', responsavel: '' })
  }

  const contadores = {
    ok:      obrigacoes.filter(o => o.status === 'ok').length,
    alerta:  obrigacoes.filter(o => o.status === 'alerta').length,
    vencido: obrigacoes.filter(o => o.status === 'vencido').length,
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
          { label: 'Em dia', value: contadores.ok, status: 'ok', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: CheckCircle },
          { label: 'Atenção', value: contadores.alerta, status: 'alerta', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: Clock },
          { label: 'Vencido', value: contadores.vencido, status: 'vencido', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: AlertTriangle },
        ].map(({ label, value, status, bg, border, text, icon: Icon }) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(filtroStatus === status ? 'Todos' : status)}
            className={`card p-4 text-center border cursor-pointer transition-all ${filtroStatus === status ? `${bg} ${border}` : 'hover:bg-gray-50'}`}
          >
            <Icon className={`w-6 h-6 mx-auto mb-1 ${filtroStatus === status ? text : 'text-gray-300'}`} />
            <p className={`text-2xl font-bold ${filtroStatus === status ? text : 'text-gray-900'}`}>{value}</p>
            <p className={`text-xs mt-0.5 ${filtroStatus === status ? text : 'text-gray-500'}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categorias.map(c => (
          <button
            key={c}
            onClick={() => setFiltro(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtro === c ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtradas.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Nenhuma obrigação encontrada.</div>
          ) : filtradas.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <StatusIcon status={item.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">{item.categoria}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{item.periodicidade}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">Resp: {item.responsavel}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Próximo venc.</p>
                <p className={`text-sm font-medium ${
                  item.status === 'vencido' ? 'text-red-600' :
                  item.status === 'alerta' ? 'text-amber-600' : 'text-gray-900'
                }`}>
                  {formatDate(item.proximaData)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={item.status} />
                <button
                  onClick={() => setModalReg(item)}
                  className="text-xs text-brand-600 font-medium bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Registrar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova */}
      <Modal
        open={modalNova}
        onClose={() => setModalNova(false)}
        title="Nova obrigação sanitária"
        footer={
          <>
            <button onClick={() => setModalNova(false)} className="btn-secondary">Cancelar</button>
            <button onClick={adicionarObrigacao} className="btn-primary">Adicionar</button>
          </>
        }
      >
        <div className="space-y-4">
          {[
            { label: 'Nome da obrigação', key: 'nome', type: 'input', placeholder: 'Ex: Calibração do autoclave' },
            { label: 'Responsável', key: 'responsavel', type: 'input', placeholder: 'Nome do responsável' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" placeholder={placeholder} value={nova[key]} onChange={e => setNova({...nova, [key]: e.target.value})} />
            </div>
          ))}
          <div>
            <label className="label">Categoria</label>
            <select className="input" value={nova.categoria} onChange={e => setNova({...nova, categoria: e.target.value})}>
              {categorias.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Periodicidade</label>
            <select className="input" value={nova.periodicidade} onChange={e => setNova({...nova, periodicidade: e.target.value})}>
              {['Semanal', 'Quinzenal', 'Mensal', 'Trimestral', 'Semestral', 'Anual', 'Conforme esquema'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal Registrar */}
      <Modal
        open={!!modalReg}
        onClose={() => setModalReg(null)}
        title="Registrar cumprimento"
        footer={
          <>
            <button onClick={() => setModalReg(null)} className="btn-secondary">Cancelar</button>
            <button onClick={registrar} className="btn-primary flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Confirmar</button>
          </>
        }
      >
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
