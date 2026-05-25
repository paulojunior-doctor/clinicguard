import { useState } from 'react'
import { Send, CheckCircle, Clock, ChevronDown, ChevronUp, Monitor, Smartphone, MapPin, Loader, Users, FileText } from 'lucide-react'
import { PageHeader, Modal, EmptyState } from '@/components/ui'
import { useCiencias, usePOPs, useColaboradores, useClinicaId } from '@/lib/useSupabase'
import { formatDate } from '@/lib/mockData'

export default function Treinamentos() {
  const clinicaId    = useClinicaId()
  const { ciencias, loading, enviar } = useCiencias(clinicaId)
  const { pops }     = usePOPs(clinicaId)
  const { colaboradores } = useColaboradores(clinicaId)

  const [expandido, setExpandido]   = useState(null)
  const [modalEnviar, setModalEnviar] = useState(false)
  const [popSel, setPopSel]         = useState('')
  const [colabSel, setColabSel]     = useState([])
  const [enviando, setEnviando]     = useState(false)

  const toggleColab = (id) =>
    setColabSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const enviarCiencia = async () => {
    if (!popSel || colabSel.length === 0) return
    setEnviando(true)
    await enviar(popSel, colabSel)
    setEnviando(false)
    setModalEnviar(false)
    setPopSel('')
    setColabSel([])
  }

  // Agrupar ciências por POP
  const porPOP = pops.map(pop => {
    const items = ciencias.filter(c => c.pop_id === pop.id)
    const assinadas = items.filter(c => c.assinado).length
    return { pop, items, assinadas, total: items.length }
  }).filter(g => g.items.length > 0)

  const totalCiencias  = ciencias.length
  const totalAssinadas = ciencias.filter(c => c.assinado).length
  const totalPendentes = ciencias.filter(c => !c.assinado).length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Treinamentos e Ciências"
        subtitle="Rastreabilidade de leitura e assinatura dos POPs"
        action={
          <button onClick={() => setModalEnviar(true)} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" /> Enviar para ciência
          </button>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalCiencias}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total de ciências</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalAssinadas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Assinadas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{totalPendentes}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pendentes</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
          <Loader className="w-4 h-4 animate-spin" /> Carregando ciências...
        </div>
      ) : porPOP.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma ciência enviada ainda"
          desc="Envie um POP para os colaboradores assinarem digitalmente."
          action={
            <button onClick={() => setModalEnviar(true)} className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" /> Enviar primeiro POP
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {porPOP.map(({ pop, items, assinadas, total }) => (
            <div key={pop.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setExpandido(expandido === pop.id ? null : pop.id)}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{pop.titulo}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full" style={{ width: `${total > 0 ? (assinadas/total)*100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{assinadas}/{total} assinados</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  assinadas === total ? 'bg-green-50 text-green-700' :
                  assinadas === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {assinadas === total ? 'Completo' : assinadas === 0 ? 'Pendente' : 'Parcial'}
                </span>
                {expandido === pop.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {expandido === pop.id && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {items.map(ciencia => {
                    const col = colaboradores.find(c => c.id === ciencia.colaborador_id)
                    return (
                      <div key={ciencia.id} className="flex items-start gap-4 px-5 py-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-semibold text-brand-600 flex-shrink-0 mt-0.5">
                          {col?.avatar || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{ciencia.nome_colaborador || col?.nome || 'Colaborador'}</p>
                          {ciencia.assinado ? (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                Assinado em {new Date(ciencia.data_assinatura).toLocaleString('pt-BR')}
                              </p>
                              {ciencia.ip && (
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <Monitor className="w-3 h-3" /> IP: {ciencia.ip} · {ciencia.dispositivo}
                                </p>
                              )}
                              {ciencia.latitude && (
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {ciencia.latitude.toFixed(4)}, {ciencia.longitude.toFixed(4)}
                                  {ciencia.endereco_geo && ` · ${ciencia.endereco_geo.split(',').slice(0,2).join(',')}`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Aguardando assinatura
                            </p>
                          )}
                        </div>
                        {ciencia.assinado
                          ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          : <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        }
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Enviar */}
      <Modal open={modalEnviar} onClose={() => setModalEnviar(false)} title="Enviar POP para ciência"
        footer={
          <>
            <button onClick={() => setModalEnviar(false)} className="btn-secondary">Cancelar</button>
            <button onClick={enviarCiencia} disabled={enviando || !popSel || colabSel.length === 0} className="btn-primary flex items-center gap-2">
              {enviando ? <Loader className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Enviar</>}
            </button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="label">POP a ser enviado</label>
            <select className="input" value={popSel} onChange={e => setPopSel(e.target.value)}>
              <option value="">Selecione um POP</option>
              {pops.filter(p => p.status === 'ativo').map(p => (
                <option key={p.id} value={p.id}>{p.titulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Colaboradores</label>
            {colaboradores.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">Cadastre colaboradores primeiro no módulo Colaboradores.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <label className="flex items-center gap-2 text-xs text-brand-600 cursor-pointer mb-1">
                  <input type="checkbox"
                    checked={colabSel.length === colaboradores.length}
                    onChange={() => setColabSel(colabSel.length === colaboradores.length ? [] : colaboradores.map(c => c.id))}
                  /> Selecionar todos
                </label>
                {colaboradores.map(c => (
                  <label key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={colabSel.includes(c.id)} onChange={() => toggleColab(c.id)} className="rounded" />
                    <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-600">{c.avatar}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.nome}</p>
                      <p className="text-xs text-gray-400">{c.cargo}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            Após enviar, vá em Colaboradores → clique em "Link" → envie por WhatsApp ou email para cada colaborador assinar.
          </div>
        </div>
      </Modal>
    </div>
  )
}
