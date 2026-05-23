import { useState } from 'react'
import { Upload, Search, FileText, File, Download, Trash2, Plus, FolderOpen } from 'lucide-react'
import { PageHeader, StatusBadge, Modal } from '@/components/ui'
import { mockDocumentos, formatDate } from '@/lib/mockData'

const tipos = ['Todos', 'Licença', 'Plano', 'Contrato', 'Medicina do Trabalho', 'Laudo']

export default function Documentos() {
  const [docs, setDocs] = useState(mockDocumentos)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [modalUpload, setModalUpload] = useState(false)
  const [drag, setDrag] = useState(false)
  const [novoDoc, setNovoDoc] = useState({ nome: '', tipo: 'Licença', validade: '' })

  const docsFiltrados = docs.filter(d => {
    const buscaOk = d.nome.toLowerCase().includes(busca.toLowerCase())
    const tipoOk = filtroTipo === 'Todos' || d.tipo === filtroTipo
    return buscaOk && tipoOk
  })

  const adicionarDoc = () => {
    if (!novoDoc.nome.trim()) return
    setDocs([...docs, {
      id: docs.length + 1,
      ...novoDoc,
      tamanho: '0.5 MB',
      enviado: new Date().toISOString().slice(0,10),
      status: 'ok'
    }])
    setModalUpload(false)
    setNovoDoc({ nome: '', tipo: 'Licença', validade: '' })
  }

  const remover = (id) => setDocs(docs.filter(d => d.id !== id))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Cofre Digital"
        subtitle="Documentos sanitários indexados e seguros"
        action={
          <button onClick={() => setModalUpload(true)} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Enviar documento
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: docs.length, color: 'text-gray-900' },
          { label: 'Em dia', value: docs.filter(d => d.status === 'ok').length, color: 'text-green-600' },
          { label: 'Atenção', value: docs.filter(d => d.status === 'alerta').length, color: 'text-amber-600' },
          { label: 'Vencidos', value: docs.filter(d => d.status === 'vencido').length, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Buscar documento..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tipos.map(t => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtroTipo === t ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-50">
          {docsFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhum documento encontrado.</p>
            </div>
          ) : docsFiltrados.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.nome}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">{doc.tipo}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{doc.tamanho}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">Enviado em {formatDate(doc.enviado)}</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-400">Validade</p>
                <p className={`text-sm font-medium ${doc.status === 'alerta' ? 'text-amber-600' : doc.status === 'vencido' ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(doc.validade)}
                </p>
              </div>
              <StatusBadge status={doc.status} />
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => remover(doc.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Upload */}
      <Modal
        open={modalUpload}
        onClose={() => setModalUpload(false)}
        title="Adicionar documento ao cofre"
        footer={
          <>
            <button onClick={() => setModalUpload(false)} className="btn-secondary">Cancelar</button>
            <button onClick={adicionarDoc} className="btn-primary">Salvar no cofre</button>
          </>
        }
      >
        <div className="space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false) }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${drag ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
          >
            <Upload className={`w-8 h-8 mx-auto mb-2 ${drag ? 'text-brand-500' : 'text-gray-300'}`} />
            <p className="text-sm font-medium text-gray-700">Arraste o arquivo ou clique para selecionar</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG até 20MB</p>
          </div>
          <div>
            <label className="label">Nome do documento</label>
            <input className="input" placeholder="Ex: Alvará Sanitário 2025" value={novoDoc.nome} onChange={e => setNovoDoc({...novoDoc, nome: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={novoDoc.tipo} onChange={e => setNovoDoc({...novoDoc, tipo: e.target.value})}>
                {tipos.filter(t => t !== 'Todos').map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Validade</label>
              <input type="date" className="input" value={novoDoc.validade} onChange={e => setNovoDoc({...novoDoc, validade: e.target.value})} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
