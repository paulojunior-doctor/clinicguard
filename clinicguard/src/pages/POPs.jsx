import { useState } from 'react'
import { Plus, Search, FileText, CheckCircle, Clock, Edit2, Eye, Users } from 'lucide-react'
import { PageHeader, StatusBadge, Modal } from '@/components/ui'
import { mockPOPs, formatDate } from '@/lib/mockData'

const categorias = ['Todas', 'Esterilização', 'Biossegurança', 'Resíduos', 'Higienização']

const templatesProntos = [
  { titulo: 'Esterilização em Autoclave',        categoria: 'Esterilização' },
  { titulo: 'Controle Biológico',                categoria: 'Esterilização' },
  { titulo: 'Higienização das Mãos',             categoria: 'Biossegurança' },
  { titulo: 'Gestão de Resíduos de Saúde',       categoria: 'Resíduos' },
  { titulo: 'Limpeza de Superfícies',            categoria: 'Higienização' },
  { titulo: 'Descarte de Perfurocortantes',      categoria: 'Resíduos' },
  { titulo: 'EPI — Uso e Descarte',              categoria: 'Biossegurança' },
  { titulo: 'Controle de Temperatura',           categoria: 'Biossegurança' },
]

export default function POPs() {
  const [pops, setPops] = useState(mockPOPs)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [modalNovo, setModalNovo] = useState(false)
  const [modalVer, setModalVer] = useState(null)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novaCategoria, setNovaCategoria] = useState('Biossegurança')
  const [novoConteudo, setNovoConteudo] = useState('')

  const popsFiltrados = pops.filter(p => {
    const buscaOk = p.titulo.toLowerCase().includes(busca.toLowerCase())
    const catOk = filtroCategoria === 'Todas' || p.categoria === filtroCategoria
    return buscaOk && catOk
  })

  const criarPOP = () => {
    if (!novoTitulo.trim()) return
    const novo = {
      id: pops.length + 1,
      titulo: novoTitulo,
      categoria: novaCategoria,
      versao: '1.0',
      status: 'revisao',
      validade: '2025-12-31',
      aprovadoPor: null,
      aprovadoEm: null,
      ciencias: 0,
      totalColaboradores: 5,
    }
    setPops([...pops, novo])
    setModalNovo(false)
    setNovoTitulo('')
    setNovoConteudo('')
  }

  const aprovar = (id) => {
    setPops(pops.map(p =>
      p.id === id
        ? { ...p, status: 'ativo', aprovadoPor: 'Dr. João Rocha', aprovadoEm: new Date().toISOString().slice(0,10) }
        : p
    ))
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
          <input
            className="input pl-9"
            placeholder="Buscar POP..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categorias.map(c => (
            <button
              key={c}
              onClick={() => setFiltroCategoria(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtroCategoria === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total de POPs', value: pops.length, color: 'text-gray-900' },
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
        <div className="divide-y divide-gray-50">
          {popsFiltrados.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Nenhum POP encontrado.</div>
          ) : popsFiltrados.map(pop => (
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
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">Validade: {formatDate(pop.validade)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                  <Users className="w-3 h-3" />
                  {pop.ciencias}/{pop.totalColaboradores}
                </div>
                <StatusBadge status={pop.status} />
                {pop.status === 'revisao' && (
                  <button
                    onClick={() => aprovar(pop.id)}
                    className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" /> Aprovar
                  </button>
                )}
                <button
                  onClick={() => setModalVer(pop)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Novo POP */}
      <Modal
        open={modalNovo}
        onClose={() => setModalNovo(false)}
        title="Novo Procedimento Operacional Padrão"
        footer={
          <>
            <button onClick={() => setModalNovo(false)} className="btn-secondary">Cancelar</button>
            <button onClick={criarPOP} className="btn-primary">Criar POP</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Título do POP *</label>
            <input
              className="input"
              placeholder="Ex: Esterilização em Autoclave"
              value={novoTitulo}
              onChange={e => setNovoTitulo(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select className="input" value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)}>
              {categorias.filter(c => c !== 'Todas').map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Ou use um template pronto</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {templatesProntos.map(t => (
                <button
                  key={t.titulo}
                  onClick={() => { setNovoTitulo(t.titulo); setNovaCategoria(t.categoria) }}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    novoTitulo === t.titulo
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-gray-200 hover:border-brand-200 hover:bg-brand-50'
                  }`}
                >
                  <p className="font-medium">{t.titulo}</p>
                  <p className="text-gray-400 mt-0.5">{t.categoria}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Conteúdo do procedimento</label>
            <textarea
              className="input h-32 resize-none"
              placeholder="Descreva os passos do procedimento..."
              value={novoConteudo}
              onChange={e => setNovoConteudo(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Visualizar POP */}
      <Modal
        open={!!modalVer}
        onClose={() => setModalVer(null)}
        title={modalVer?.titulo || ''}
        footer={
          <button onClick={() => setModalVer(null)} className="btn-secondary">Fechar</button>
        }
      >
        {modalVer && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Categoria', value: modalVer.categoria },
                { label: 'Versão', value: `v${modalVer.versao}` },
                { label: 'Status', value: <StatusBadge status={modalVer.status} /> },
                { label: 'Validade', value: formatDate(modalVer.validade) },
                { label: 'Aprovado por', value: modalVer.aprovadoPor || '—' },
                { label: 'Aprovado em', value: formatDate(modalVer.aprovadoEm) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Ciências dos colaboradores</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-400 rounded-full"
                  style={{ width: `${(modalVer.ciencias / modalVer.totalColaboradores) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{modalVer.ciencias} de {modalVer.totalColaboradores} colaboradores assinaram</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
              Conteúdo completo do POP e assinatura digital disponíveis na versão com backend conectado.
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
