import { useState, useRef } from 'react'
import { Plus, AlertTriangle, CheckCircle, Clock, Upload, Loader, FileText, X, Eye } from 'lucide-react'
import { PageHeader, StatusBadge, Modal, EmptyState } from '@/components/ui'
import { useObrigacoes, useClinicaId } from '@/lib/useSupabase'
import { supabase } from '@/lib/supabase'

const BUCKET = 'documentos'

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
  if (diff < 0)   return 'vencido'
  if (diff <= 30) return 'alerta'
  return 'ok'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

  // ── Estado do registro com comprovante ──────────────────────────────────
  const [dataExec, setDataExec]         = useState(new Date().toISOString().slice(0,10))
  const [executante, setExecutante]     = useState('')
  const [observacoes, setObservacoes]   = useState('')
  const [arquivo, setArquivo]           = useState(null)
  const [uploading, setUploading]       = useState(false)
  const [uploadPct, setUploadPct]       = useState(0)
  const [dragging, setDragging]         = useState(false)
  const fileRef                         = useRef()

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

  // ── Upload do comprovante ──────────────────────────────────────────────
  const handleArquivo = (file) => {
    if (!file) return
    const tipos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!tipos.includes(file.type)) {
      alert('Apenas PDF, JPG ou PNG são aceitos.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 10 MB.')
      return
    }
    setArquivo(file)
  }

  // ── Registrar cumprimento com comprovante ──────────────────────────────
  const registrarCumprimento = async () => {
    setRegistrando(true)
    let comprovante_url  = null
    let comprovante_nome = null

    // Upload do arquivo se houver
    if (arquivo) {
      setUploading(true)
      setUploadPct(10)

      const ext      = arquivo.name.split('.').pop()
      const nomeArq  = `${Date.now()}_comprovante_${modalReg.id}.${ext}`

      // Progresso simulado
      const interval = setInterval(() => {
        setUploadPct(p => p >= 85 ? p : p + 15)
      }, 200)

      const { data: upData, error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(nomeArq, arquivo, { cacheControl: '3600', upsert: true })

      clearInterval(interval)
      setUploadPct(100)

      if (upErr) {
        alert('Erro no upload: ' + upErr.message)
        setUploading(false)
        setRegistrando(false)
        return
      }

      // URL pública
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(nomeArq)
      comprovante_url  = urlData.publicUrl
      comprovante_nome = arquivo.name

      setUploading(false)
      setUploadPct(0)
    }

    // Registrar no banco com todos os dados
    await registrar(modalReg.id, {
      data_execucao:        dataExec,
      executante:           executante,
      observacoes_registro: observacoes,
      comprovante_url,
      comprovante_nome,
    })

    setRegistrando(false)
    fecharModalReg()
  }

  const fecharModalReg = () => {
    setModalReg(null)
    setDataExec(new Date().toISOString().slice(0,10))
    setExecutante('')
    setObservacoes('')
    setArquivo(null)
    setUploadPct(0)
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
                <div key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5 flex-shrink-0"><StatusIcon status={status} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{item.categoria}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{item.periodicidade}</span>
                      {item.responsavel && <><span className="text-xs text-gray-300">·</span><span className="text-xs text-gray-400">Resp: {item.responsavel}</span></>}
                    </div>
                    {item.descricao && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-2xl bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        {item.descricao}
                      </p>
                    )}
                    {/* Comprovante anexado */}
                    {item.comprovante_url && (
                      <a href={item.comprovante_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors">
                        <FileText className="w-3 h-3" />
                        {item.comprovante_nome || 'Ver comprovante'}
                      </a>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Próximo venc.</p>
                    <p className={`text-sm font-medium ${status === 'vencido' ? 'text-red-600' : status === 'alerta' ? 'text-amber-600' : 'text-gray-900'}`}>
                      {formatDate(item.proxima_data)}
                    </p>
                    {item.ultima_data && (
                      <p className="text-xs text-gray-400 mt-0.5">Último: {formatDate(item.ultima_data)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={status} />
                    <button onClick={() => { setModalReg(item); setExecutante(item.responsavel || '') }}
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
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <p className="text-xs text-gray-400">Ou edite os campos abaixo:</p>
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
      </Modal>

      {/* Modal Registrar Cumprimento */}
      <Modal open={!!modalReg} onClose={fecharModalReg} title="Registrar cumprimento"
        footer={
          <>
            <button onClick={fecharModalReg} className="btn-secondary">Cancelar</button>
            <button onClick={registrarCumprimento} disabled={registrando || uploading} className="btn-primary flex items-center gap-2">
              {(registrando || uploading) ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" />Confirmar</>}
            </button>
          </>
        }>
        {modalReg && (
          <div className="space-y-4 text-sm">

            {/* Nome da obrigação */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Obrigação</p>
              <p className="font-medium text-gray-900">{modalReg.nome}</p>
              {modalReg.descricao && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{modalReg.descricao}</p>
              )}
            </div>

            {/* Data e executante */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Data de execução *</label>
                <input type="date" className="input" value={dataExec} onChange={e => setDataExec(e.target.value)} />
              </div>
              <div>
                <label className="label">Executante</label>
                <input className="input" placeholder="Empresa ou profissional" value={executante} onChange={e => setExecutante(e.target.value)} />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="label">Observações</label>
              <textarea className="input h-16 resize-none" placeholder="Observações sobre a execução, número do certificado, etc..." value={observacoes} onChange={e => setObservacoes(e.target.value)} />
            </div>

            {/* Upload de comprovante */}
            <div>
              <label className="label">Comprovante (PDF, JPG ou PNG · máx. 10 MB)</label>

              {!arquivo ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${dragging ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleArquivo(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current.click()}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleArquivo(e.target.files[0])} />
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Arraste ou <span className="text-brand-600 font-medium">clique para selecionar</span></p>
                  <p className="text-xs text-gray-400 mt-1">CESP, laudo técnico, nota fiscal, etc.</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-800 truncate">{arquivo.name}</p>
                    <p className="text-xs text-green-600">{formatBytes(arquivo.size)} · pronto para enviar</p>
                  </div>
                  <button onClick={() => setArquivo(null)} className="text-green-500 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Barra de progresso do upload */}
              {uploading && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Enviando comprovante...</span>
                    <span>{uploadPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Comprovante já salvo anteriormente */}
            {modalReg.comprovante_url && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-700 font-medium">Comprovante anterior salvo</p>
                  <p className="text-xs text-blue-500 truncate">{modalReg.comprovante_nome}</p>
                </div>
                <a href={modalReg.comprovante_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <Eye className="w-3.5 h-3.5" /> Ver
                </a>
              </div>
            )}

          </div>
        )}
      </Modal>
    </div>
  )
}
