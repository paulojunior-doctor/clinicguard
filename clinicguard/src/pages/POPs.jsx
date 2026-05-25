import { useState } from 'react'
import { Plus, Search, FileText, CheckCircle, Eye, Users, Trash2, Loader } from 'lucide-react'
import { PageHeader, StatusBadge, Modal, EmptyState } from '@/components/ui'
import { usePOPs, useColaboradores, useClinicaId } from '@/lib/useSupabase'
import { formatDate } from '@/lib/mockData'

const categorias = ['Todas', 'Esterilização', 'Biossegurança', 'Resíduos', 'Higienização', 'Atendimento', 'Administrativo']

const templatesProntos = [
  { titulo: 'Esterilização em Autoclave',        categoria: 'Esterilização',  conteudo: 'Este POP estabelece os procedimentos para esterilização de materiais em autoclave conforme RDC 1.002/2025...' },
  { titulo: 'Controle Biológico da Autoclave',   categoria: 'Esterilização',  conteudo: 'Procedimento para realização do controle biológico semanal da autoclave...' },
  { titulo: 'Higienização das Mãos',             categoria: 'Biossegurança',  conteudo: 'Técnica de higienização das mãos conforme protocolo da ANVISA...' },
  { titulo: 'Gestão de Resíduos de Saúde',       categoria: 'Resíduos',       conteudo: 'Procedimentos para segregação, acondicionamento e descarte de resíduos conforme PGRSS...' },
  { titulo: 'Limpeza e Desinfecção de Superfícies', categoria: 'Higienização', conteudo: 'Protocolo de limpeza e desinfecção de superfícies do consultório...' },
  { titulo: 'Descarte de Perfurocortantes',      categoria: 'Resíduos',       conteudo: 'Procedimentos para descarte seguro de materiais perfurocortantes...' },
  { titulo: 'Uso e Descarte de EPIs',            categoria: 'Biossegurança',  conteudo: 'Normas para uso correto e descarte de equipamentos de proteção individual...' },
  { titulo: 'Controle de Temperatura',           categoria: 'Biossegurança',  conteudo: 'Monitoramento e registro de temperatura de materiais e ambiente...' },
]

export default function POPs() {
  const clinicaId = useClinicaId()
  const { pops, loading, criar, aprovar, remover } = usePOPs(clinicaId)
  const { colaboradores } = useColaboradores(clinicaId)

  const [busca, setBusca]         = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [modalNovo, setModalNovo] = useState(false)
  const [modalVer, setModalVer]   = useState(null)
  const [salvando, setSalvando]   = useState(false)
  const [novo, setNovo]           = useState({ titulo: '', categoria: 'Biossegurança', conteudo: '', validade: '' })

  const popsFiltrados = pops.filter(p => {
    const buscaOk = p.titulo.toLowerCase().includes(busca.toLowerCase())
    const catOk   = filtroCategoria === 'Todas' || p.categoria === filtroCategoria
    return buscaOk && catOk
  })

  const criarPOP = async () => {
    if (!novo.titulo.trim()) return
    setSalvando(true)
    await criar({ ...novo, versao: '1.0', status: 'revisao' })
    setSalvando(false)
    setModalNovo(false)
    setNovo({ titulo: '', categoria: 'Biossegurança', conteudo: '', validade: '' })
  }

  const aprovarPOP = async (id) => {
    await aprovar(id, 'RT')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="POPs"
        subtitle="Procedimentos Operacionais Padrão da clínica"
        action={
          <button onClick={() => setModalNovo(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo POP
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Buscar POP..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categorias.map(c => (
            <button key={c} onClick={() => setFiltroCategoria(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtroCategoria === c ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total', value: pops.length, color: 'text-gray-900' },
          { label: 'Ativos', value: pops.filter(p => p.status === 'ativo').length, color: 'text-green-600' },
          { label: 'Aguardando aprovação', value: pops.filter(p => p.status === 'revisao').length, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <Loader className="w-4 h-4 animate-spin" /> Carregando POPs...
          </div>
        ) : popsFiltrados.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={pops.length === 0 ? 'Nenhum POP cadastrado ainda' : 'Nenhum POP encontrado'}
            desc={pops.length === 0 ? 'Crie seu primeiro POP usando um template ou do zero.' : 'Tente mudar o filtro ou a busca.'}
            action={pops.length === 0 && <button onClick={() => setModalNovo(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Criar primeiro POP</button>}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {popsFiltrados.map(pop => (
              <div key={pop.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{pop.titulo}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{pop.categoria}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">v{pop.versao}</span>
                    {pop.validade && <><span className="text-xs text-gray-300">·</span><span className="text-xs text-gray-400">Validade: {formatDate(pop.validade)}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={pop.status} />
                  {pop.status === 'revisao' && (
                    <button onClick={() => aprovarPOP(pop.id)}
                      className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors">
                      <CheckCircle className="w-3 h-3" /> Aprovar
                    </button>
                  )}
                  <button onClick={() => setModalVer(pop)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => remover(pop.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo POP */}
      <Modal open={modalNovo} onClose={() => setModalNovo(false)} title="Novo Procedimento Operacional Padrão"
        footer={<><button onClick={() => setModalNovo(false)} className="btn-secondary">Cancelar</button><button onClick={criarPOP} disabled={salvando} className="btn-primary flex items-center gap-2">{salvando ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Criar POP</>}</button></>}>
        <div className="space-y-4">
          <div>
            <label className="label">Título do POP *</label>
            <input className="input" placeholder="Ex: Esterilização em Autoclave" value={novo.titulo} onChange={e => setNovo({...novo, titulo: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={novo.categoria} onChange={e => setNovo({...novo, categoria: e.target.value})}>
                {categorias.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Validade</label>
              <input type="date" className="input" value={novo.validade} onChange={e => setNovo({...novo, validade: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Ou use um template pronto</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {templatesProntos.map(t => (
                <button key={t.titulo} onClick={() => setNovo({...novo, titulo: t.titulo, categoria: t.categoria, conteudo: t.conteudo})}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${novo.titulo === t.titulo ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-200 hover:bg-brand-50'}`}>
                  <p className="font-medium">{t.titulo}</p>
                  <p className="text-gray-400 mt-0.5">{t.categoria}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Conteúdo do procedimento</label>
            <textarea className="input h-32 resize-none" placeholder="Descreva os passos do procedimento..." value={novo.conteudo} onChange={e => setNovo({...novo, conteudo: e.target.value})} />
          </div>
        </div>
      </Modal>

      {/* Modal Ver POP */}
      <Modal open={!!modalVer} onClose={() => setModalVer(null)} title={modalVer?.titulo || ''}
        footer={<button onClick={() => setModalVer(null)} className="btn-secondary">Fechar</button>}>
        {modalVer && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Categoria', value: modalVer.categoria },
                { label: 'Versão', value: `v${modalVer.versao}` },
                { label: 'Status', value: <StatusBadge status={modalVer.status} /> },
                { label: 'Validade', value: formatDate(modalVer.validade) },
                { label: 'Aprovado por', value: modalVer.aprovado_por || '—' },
                { label: 'Aprovado em', value: formatDate(modalVer.aprovado_em) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {modalVer.conteudo && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Conteúdo</p>
                <p className="text-sm text-gray-700 leading-relaxed">{modalVer.conteudo}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
