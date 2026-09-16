/**
 * ClinicGuard — Módulo de Documentos (Cofre Digital)
 * Upload e download de PDFs via Supabase Storage, com categorização,
 * registro na tabela `documentos` (escopo por clínica) e análise
 * de documentos por IA para Controle de Pragas e Vetores.
 *
 * Instalação:
 *   npm install @supabase/supabase-js
 *
 * Configuração:
 *   Crie src/lib/supabase.js com:
 *     import { createClient } from '@supabase/supabase-js'
 *     export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 *
 * Uso:
 *   import Documentos from './Documentos'
 *   <Documentos />
 */

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useDocumentos, useObrigacoes, gerarObrigacoesDoManual } from '@/lib/useSupabase'
import ConferenciaExtracao from '@/components/ConferenciaExtracao'

const BUCKET = 'documentos'

const CATEGORIAS = [
  { id: 'outros', label: 'Outros documentos' },
  { id: 'controle_pragas', label: 'Controle de Pragas e Vetores' },
]

function labelCategoria(id) {
  return CATEGORIAS.find(c => c.id === id)?.label || 'Outros documentos'
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ─── Estilos ────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .cg-docs * { box-sizing: border-box; margin: 0; padding: 0; }

  .cg-docs {
    font-family: 'DM Sans', sans-serif;
    background: #f7f6f2;
    min-height: 100vh;
    padding: 40px 32px;
    color: #1a1916;
  }

  .cg-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .cg-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #1a1916;
    line-height: 1;
  }

  .cg-title span {
    color: #c8692a;
  }

  .cg-subtitle {
    font-size: 13px;
    color: #7a7870;
    margin-top: 5px;
  }

  /* Categoria select */
  .cg-categoria-wrap {
    margin-bottom: 16px;
  }

  .cg-categoria-label {
    font-size: 12px;
    font-weight: 500;
    color: #7a7870;
    margin-bottom: 6px;
    display: block;
  }

  .cg-select {
    width: 100%;
    max-width: 320px;
    height: 40px;
    border: 1px solid #dedad4;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1916;
    outline: none;
    cursor: pointer;
  }

  .cg-select:focus { border-color: #c8692a; }

  /* Badge de categoria na lista */
  .cg-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 99px;
    background: #f0ede8;
    color: #7a7870;
    margin-top: 3px;
  }

  .cg-badge.pragas {
    background: #fff0e8;
    color: #c8692a;
  }

  /* Upload zone */
  .cg-upload-zone {
    border: 1.5px dashed #d4cfc7;
    border-radius: 12px;
    padding: 32px 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: #ffffff;
    margin-bottom: 32px;
    position: relative;
  }

  .cg-upload-zone.dragging {
    border-color: #c8692a;
    background: #fff8f4;
  }

  .cg-upload-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .cg-upload-icon {
    width: 40px;
    height: 40px;
    background: #f0ede8;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }

  .cg-upload-icon svg {
    width: 20px;
    height: 20px;
    stroke: #7a7870;
  }

  .cg-upload-label {
    font-size: 14px;
    font-weight: 500;
    color: #1a1916;
  }

  .cg-upload-label em {
    font-style: normal;
    color: #c8692a;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .cg-upload-hint {
    font-size: 12px;
    color: #aaa8a2;
    margin-top: 4px;
  }

  /* Progress bar */
  .cg-progress-wrap {
    margin-bottom: 32px;
    background: #fff;
    border-radius: 10px;
    padding: 16px 20px;
    border: 1px solid #ebe8e2;
  }

  .cg-progress-name {
    font-size: 13px;
    color: #1a1916;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }

  .cg-progress-bar-bg {
    height: 4px;
    background: #ebe8e2;
    border-radius: 99px;
    overflow: hidden;
  }

  .cg-progress-bar {
    height: 100%;
    background: #c8692a;
    border-radius: 99px;
    transition: width 0.3s;
  }

  /* Toast */
  .cg-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    z-index: 1000;
    animation: cg-slidein 0.25s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 320px;
  }

  .cg-toast.success { background: #1a1916; color: #fff; }
  .cg-toast.error   { background: #c8692a; color: #fff; }

  @keyframes cg-slidein {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Toolbar */
  .cg-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .cg-search {
    flex: 1;
    min-width: 200px;
    height: 38px;
    border: 1px solid #dedad4;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1916;
    outline: none;
    transition: border-color 0.15s;
  }

  .cg-search:focus { border-color: #c8692a; }
  .cg-search::placeholder { color: #b0ada7; }

  .cg-btn {
    height: 38px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    border: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cg-btn:active { transform: scale(0.97); }
  .cg-btn-primary { background: #1a1916; color: #fff; }
  .cg-btn-primary:hover { opacity: 0.85; }
  .cg-btn-ghost { background: transparent; color: #7a7870; border: 1px solid #dedad4; }
  .cg-btn-ghost:hover { background: #f0ede8; color: #1a1916; }
  .cg-btn-danger { background: transparent; color: #c8692a; border: 1px solid #e8c5ad; }
  .cg-btn-danger:hover { background: #fff8f4; }
  .cg-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Stats */
  .cg-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .cg-stat {
    background: #fff;
    border: 1px solid #ebe8e2;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .cg-stat-label {
    font-size: 11px;
    color: #aaa8a2;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 4px;
  }

  .cg-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #1a1916;
  }

  /* File list */
  .cg-list {
    background: #fff;
    border: 1px solid #ebe8e2;
    border-radius: 12px;
    overflow: hidden;
  }

  .cg-list-header {
    display: grid;
    grid-template-columns: 1fr 100px 120px 130px;
    padding: 10px 20px;
    border-bottom: 1px solid #f0ede8;
    font-size: 11px;
    color: #aaa8a2;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 500;
  }

  .cg-file-row {
    display: grid;
    grid-template-columns: 1fr 100px 120px 130px;
    padding: 14px 20px;
    align-items: center;
    border-bottom: 1px solid #f7f6f2;
    transition: background 0.1s;
  }

  .cg-file-row:last-child { border-bottom: none; }
  .cg-file-row:hover { background: #faf9f7; }

  .cg-file-name {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #1a1916;
    font-weight: 500;
    overflow: hidden;
  }

  .cg-file-name-col {
    overflow: hidden;
  }

  .cg-file-name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .cg-file-icon {
    width: 32px;
    height: 32px;
    background: #fff0e8;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cg-file-icon svg { width: 16px; height: 16px; stroke: #c8692a; }

  .cg-file-size, .cg-file-date {
    font-size: 13px;
    color: #7a7870;
  }

  .cg-file-actions {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  .cg-icon-btn {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    border: 1px solid #ebe8e2;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7a7870;
    transition: background 0.1s, color 0.1s;
  }

  .cg-icon-btn:hover { background: #f0ede8; color: #1a1916; }
  .cg-icon-btn svg { width: 14px; height: 14px; stroke: currentColor; }

  /* Empty */
  .cg-empty {
    text-align: center;
    padding: 60px 20px;
    color: #aaa8a2;
  }

  .cg-empty svg { width: 48px; height: 48px; stroke: #dedad4; margin-bottom: 12px; }
  .cg-empty p { font-size: 14px; }

  /* Loading */
  .cg-loading {
    display: flex;
    justify-content: center;
    padding: 48px;
  }

  .cg-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #ebe8e2;
    border-top-color: #c8692a;
    border-radius: 50%;
    animation: cg-spin 0.7s linear infinite;
  }

  @keyframes cg-spin { to { transform: rotate(360deg); } }

  /* Responsive */
  @media (max-width: 600px) {
    .cg-docs { padding: 24px 16px; }
    .cg-list-header { grid-template-columns: 1fr 90px; }
    .cg-list-header .cg-col-size,
    .cg-list-header .cg-col-date { display: none; }
    .cg-file-row { grid-template-columns: 1fr 90px; }
    .cg-file-size, .cg-file-date { display: none; }
  }
`

// ─── Ícones SVG inline ───────────────────────────────────────────────────────
const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)
const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>
  </svg>
)

// ─── Componente principal ────────────────────────────────────────────────────
export default function Documentos() {
  const { clinicaId } = useAuth()
  const { documentos, criar: criarDocumento, remover: removerDocumento, refetch: refetchDocumentos } = useDocumentos(clinicaId)
  const { upsertPorOrigem } = useObrigacoes(clinicaId)

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadName, setUploadName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('outros')
  const fileInputRef = useRef()

  const [modalAberto, setModalAberto] = useState(false)
  const [analisando, setAnalisando] = useState(false)
  const [erroAnalise, setErroAnalise] = useState(null)
  const [resultadoAnalise, setResultadoAnalise] = useState(null)
  const [arquivoEmAnalise, setArquivoEmAnalise] = useState(null)

  // Carrega a lista de arquivos do bucket — escopado por clínica (pasta = clinica_id)
  const fetchFiles = async () => {
    if (!clinicaId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.storage.from(BUCKET).list(clinicaId, {
      sortBy: { column: 'created_at', order: 'desc' }
    })
    if (error) {
      showToast('Erro ao carregar arquivos: ' + error.message, 'error')
    } else {
      setFiles((data || []).filter(f => f.name !== '.emptyFolderPlaceholder'))
    }
    setLoading(false)
  }

  useEffect(() => { fetchFiles() }, [clinicaId])

  // Toast temporário
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Encontra o registro da tabela `documentos` correspondente a um arquivo do storage
  const registroDoArquivo = (fileName) => {
    const caminhoCompleto = `${clinicaId}/${fileName}`
    return documentos.find(d => d.url === caminhoCompleto)
  }

  // Analisa um documento com IA (chama o endpoint /api/analisar-documento)
  const handleAnalisarComIA = async (file, registro) => {
    setArquivoEmAnalise({ fileName: file.name, registro })
    setModalAberto(true)
    setAnalisando(true)
    setErroAnalise(null)
    setResultadoAnalise(null)

    try {
      const { data: blob, error: errDownload } = await supabase.storage
        .from(BUCKET).download(`${clinicaId}/${file.name}`)
      if (errDownload) throw new Error('Não foi possível baixar o documento para análise.')

      const pdfBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const res = await fetch('/api/analisar-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64, fileName: file.name.replace(/^\d+_/, '') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar documento.')

      await supabase.from('eventos_auditoria').insert({
        clinica_id: clinicaId,
        documento_id: registro?.id || null,
        tipo_evento: 'documento_analisado_ia',
        metadata: data,
      })

      setResultadoAnalise(data)
    } catch (e) {
      setErroAnalise(e.message)
    } finally {
      setAnalisando(false)
    }
  }

  // Aplica os campos confirmados pelo usuário ao Manual e às Obrigações
  const handleConfirmarExtracao = async (camposEditados) => {
    const STORAGE_KEY = 'clinicguard_manual_dados'
    const atual = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const atualizado = { ...atual, ...camposEditados }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado))

    const geradas = gerarObrigacoesDoManual(atualizado)
    const obrigacaoPragas = geradas.find(o => o.origem === 'manual_dedetizacao')
    let obrigacaoSalva = null
    if (obrigacaoPragas) {
      obrigacaoSalva = await upsertPorOrigem({
        ...obrigacaoPragas,
        comprovante_url: arquivoEmAnalise?.registro?.url || null,
        comprovante_nome: arquivoEmAnalise?.fileName?.replace(/^\d+_/, '') || null,
      })
    }

    await supabase.from('eventos_auditoria').insert({
      clinica_id: clinicaId,
      documento_id: arquivoEmAnalise?.registro?.id || null,
      tipo_evento: 'documento_confirmado',
      metadata: { campos_aplicados: camposEditados, obrigacao_id: obrigacaoSalva?.id || null },
    })

    setModalAberto(false)
    showToast(obrigacaoPragas
      ? '✅ Manual e Obrigações atualizados a partir do documento.'
      : '✅ Manual atualizado. (Sem data ou periodicidade informada, a obrigação não foi criada — preencha manualmente na aba Obrigações se necessário.)')
  }

  // Upload de arquivo
  const handleUpload = async (file) => {
    if (!file) return
    if (!clinicaId) {
      showToast('Não foi possível identificar a clínica. Faça login novamente.', 'error')
      return
    }
    if (file.type !== 'application/pdf') {
      showToast('Apenas arquivos PDF são aceitos.', 'error')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadName(file.name)

    // Simula progresso (Supabase JS v2 não emite eventos de progresso nativamente)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) { clearInterval(progressInterval); return prev }
        return prev + Math.random() * 15
      })
    }, 200)

    const nomeArquivo = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = `${clinicaId}/${nomeArquivo}`

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    clearInterval(progressInterval)
    setUploadProgress(100)

    if (!error) {
      // Registra também na tabela `documentos`, com a categoria escolhida
      await criarDocumento({
        nome: file.name,
        tipo: categoriaSelecionada,
        tamanho: formatBytes(file.size),
        url: filePath,
        status: 'ok',
      })
    }

    setTimeout(() => {
      setUploading(false)
      setUploadProgress(0)
      setUploadName('')
      if (error) {
        showToast('Erro no upload: ' + error.message, 'error')
      } else {
        showToast(`"${file.name}" enviado como "${labelCategoria(categoriaSelecionada)}".`)
        fetchFiles()
      }
    }, 400)
  }

  // Download de arquivo
  const handleDownload = async (fileName) => {
    const { data, error } = await supabase.storage.from(BUCKET).download(`${clinicaId}/${fileName}`)
    if (error) {
      showToast('Erro ao baixar arquivo.', 'error')
      return
    }
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.replace(/^\d+_/, '') // remove prefixo de timestamp
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Download iniciado: ${a.download}`)
  }

  // Visualizar PDF no navegador (nova aba)
  const handleView = async (fileName) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${clinicaId}/${fileName}`)
    window.open(data.publicUrl, '_blank')
  }

  // Excluir arquivo
  const handleDelete = async (fileName) => {
    if (!window.confirm(`Excluir "${fileName.replace(/^\d+_/, '')}"? Essa ação não pode ser desfeita.`)) return
    const { error } = await supabase.storage.from(BUCKET).remove([`${clinicaId}/${fileName}`])
    if (error) {
      showToast('Erro ao excluir: ' + error.message, 'error')
      return
    }
    const registro = registroDoArquivo(fileName)
    if (registro) await removerDocumento(registro.id)
    showToast('Arquivo excluído.')
    fetchFiles()
  }

  // Drag and drop
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  // Filtro de busca
  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  // Estatísticas
  const totalSize = files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)

  return (
    <>
      <style>{styles}</style>
      <div className="cg-docs">

        {/* Header */}
        <div className="cg-header">
          <div>
            <div className="cg-title">Clinic<span>Guard</span></div>
            <div className="cg-subtitle">Documentos de compliance sanitário</div>
          </div>
          <button className="cg-btn cg-btn-ghost" onClick={fetchFiles}>
            <IconRefresh /> Atualizar
          </button>
        </div>

        {/* Seletor de categoria */}
        <div className="cg-categoria-wrap">
          <label className="cg-categoria-label" htmlFor="cg-categoria-select">
            Categoria do próximo documento a enviar
          </label>
          <select
            id="cg-categoria-select"
            className="cg-select"
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
          >
            {CATEGORIAS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Upload zone */}
        <div
          className={`cg-upload-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          <div className="cg-upload-icon">
            <IconUpload />
          </div>
          <div className="cg-upload-label">
            {uploading ? 'Enviando...' : <>Arraste um PDF ou <em>clique para selecionar</em></>}
          </div>
          <div className="cg-upload-hint">Somente arquivos PDF · máx. 50 MB · categoria: {labelCategoria(categoriaSelecionada)}</div>
        </div>

        {/* Barra de progresso */}
        {uploading && (
          <div className="cg-progress-wrap">
            <div className="cg-progress-name">
              <span>{uploadName}</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="cg-progress-bar-bg">
              <div className="cg-progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {!loading && (
          <div className="cg-stats">
            <div className="cg-stat">
              <div className="cg-stat-label">Total de arquivos</div>
              <div className="cg-stat-value">{files.length}</div>
            </div>
            <div className="cg-stat">
              <div className="cg-stat-label">Espaço usado</div>
              <div className="cg-stat-value">{formatBytes(totalSize)}</div>
            </div>
            <div className="cg-stat">
              <div className="cg-stat-label">Bucket</div>
              <div className="cg-stat-value" style={{ fontSize: 14, paddingTop: 4 }}>documentos</div>
            </div>
          </div>
        )}

        {/* Toolbar de busca */}
        {!loading && files.length > 0 && (
          <div className="cg-toolbar">
            <input
              className="cg-search"
              type="text"
              placeholder="Buscar documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Lista de arquivos */}
        {loading ? (
          <div className="cg-loading"><div className="cg-spinner" /></div>
        ) : filteredFiles.length === 0 ? (
          <div className="cg-list">
            <div className="cg-empty">
              <IconFile />
              <p>{search ? 'Nenhum resultado encontrado.' : 'Nenhum documento enviado ainda.'}</p>
            </div>
          </div>
        ) : (
          <div className="cg-list">
            <div className="cg-list-header">
              <div>Nome</div>
              <div className="cg-col-size">Tamanho</div>
              <div className="cg-col-date">Enviado em</div>
              <div style={{ textAlign: 'right' }}>Ações</div>
            </div>
            {filteredFiles.map((file) => {
              const registro = registroDoArquivo(file.name)
              const tipo = registro?.tipo || 'outros'
              return (
                <div className="cg-file-row" key={file.name}>
                  <div className="cg-file-name">
                    <div className="cg-file-icon"><IconFile /></div>
                    <div className="cg-file-name-col">
                      <span className="cg-file-name-text">
                        {file.name.replace(/^\d+_/, '')}
                      </span>
                      <span className={`cg-badge ${tipo === 'controle_pragas' ? 'pragas' : ''}`}>
                        {labelCategoria(tipo)}
                      </span>
                    </div>
                  </div>
                  <div className="cg-file-size">{formatBytes(file.metadata?.size)}</div>
                  <div className="cg-file-date">{formatDate(file.created_at)}</div>
                  <div className="cg-file-actions">
                    {tipo === 'controle_pragas' && (
                      <button
                        className="cg-icon-btn"
                        title="Analisar com IA"
                        style={{ color: '#c8692a', borderColor: '#e8c5ad' }}
                        onClick={() => handleAnalisarComIA(file, registro)}
                      >
                        <IconSparkle />
                      </button>
                    )}
                    <button
                      className="cg-icon-btn"
                      title="Visualizar no navegador"
                      onClick={() => handleView(file.name)}
                    >
                      <IconEye />
                    </button>
                    <button
                      className="cg-icon-btn"
                      title="Baixar"
                      onClick={() => handleDownload(file.name)}
                    >
                      <IconDownload />
                    </button>
                    <button
                      className="cg-icon-btn"
                      title="Excluir"
                      style={{ color: '#c8692a' }}
                      onClick={() => handleDelete(file.name)}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Toast de notificação */}
      {toast && (
        <div className={`cg-toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      <ConferenciaExtracao
        open={modalAberto}
        loading={analisando}
        error={erroAnalise}
        resultado={resultadoAnalise}
        fileName={arquivoEmAnalise?.fileName?.replace(/^\d+_/, '')}
        onClose={() => setModalAberto(false)}
        onConfirm={handleConfirmarExtracao}
      />
    </>
  )
}