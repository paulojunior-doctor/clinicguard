import { useState } from 'react'
import { Send, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Monitor, Smartphone } from 'lucide-react'
import { PageHeader, StatusBadge, Modal } from '@/components/ui'
import { mockCiencias, mockColaboradores, mockPOPs, formatDate } from '@/lib/mockData'

export default function Treinamentos() {
  const [ciencias, setCiencias] = useState(mockCiencias)
  const [expandido, setExpandido] = useState(null)
  const [modalEnviar, setModalEnviar] = useState(false)
  const [popSelecionado, setPopSelecionado] = useState('')
  const [colaboradoresSel, setColaboradoresSel] = useState([])
  const [modalCiencia, setModalCiencia] = useState(null)
  const [quizResp, setQuizResp] = useState({})
  const [assinado, setAssinado] = useState(false)

  const toggleColab = (id) => {
    setColaboradoresSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const enviarCiencia = () => {
    if (!popSelecionado || colaboradoresSel.length === 0) return
    const pop = mockPOPs.find(p => p.id === parseInt(popSelecionado))
    const novas = colaboradoresSel.map(colId => {
      const col = mockColaboradores.find(c => c.id === colId)
      return {
        id: ciencias.length + colId,
        popId: pop.id,
        popTitulo: pop.titulo,
        colaboradorId: colId,
        colaborador: col.nome,
        data: null, ip: null, dispositivo: null, assinado: false, quiz: null
      }
    })
    setCiencias([...ciencias, ...novas])
    setModalEnviar(false)
    setPopSelecionado('')
    setColaboradoresSel([])
  }

  const assinarCiencia = (cienciaId) => {
    setCiencias(ciencias.map(c =>
      c.id === cienciaId
        ? { ...c, assinado: true, data: new Date().toISOString().slice(0,10), ip: '192.168.1.105', dispositivo: 'Chrome / Windows', quiz: 85 }
        : c
    ))
    setModalCiencia(null)
    setAssinado(false)
    setQuizResp({})
  }

  // Agrupa por POP
  const porPOP = mockPOPs.map(pop => {
    const items = ciencias.filter(c => c.popId === pop.id)
    const assinadas = items.filter(c => c.assinado).length
    return { pop, items, assinadas, total: items.length }
  }).filter(g => g.items.length > 0)

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
        {[
          { label: 'Total de ciências', value: ciencias.length, color: 'text-gray-900' },
          { label: 'Assinadas', value: ciencias.filter(c => c.assinado).length, color: 'text-green-600' },
          { label: 'Pendentes', value: ciencias.filter(c => !c.assinado).length, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Lista por POP */}
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
                    <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(assinadas/total)*100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{assinadas}/{total} assinados</span>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                assinadas === total ? 'bg-green-50 text-green-700' :
                assinadas === 0 ? 'bg-red-50 text-red-700' :
                'bg-amber-50 text-amber-700'
              }`}>
                {assinadas === total ? 'Completo' : assinadas === 0 ? 'Sem ciências' : 'Parcial'}
              </span>
              {expandido === pop.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandido === pop.id && (
              <div className="border-t border-gray-50 divide-y divide-gray-50">
                {items.map(ciencia => (
                  <div key={ciencia.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-semibold text-brand-600 flex-shrink-0">
                      {mockColaboradores.find(c => c.id === ciencia.colaboradorId)?.avatar || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ciencia.colaborador}</p>
                      {ciencia.assinado ? (
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400">{formatDate(ciencia.data)}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Monitor className="w-3 h-3" /> {ciencia.dispositivo}
                          </span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">IP: {ciencia.ip}</span>
                          {ciencia.quiz && <span className="text-xs text-brand-600 font-medium">Quiz: {ciencia.quiz}%</span>}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">Aguardando assinatura</p>
                      )}
                    </div>
                    {ciencia.assinado ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <button
                        onClick={() => setModalCiencia(ciencia)}
                        className="text-xs text-brand-600 font-medium bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Simular assinatura
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Enviar */}
      <Modal
        open={modalEnviar}
        onClose={() => setModalEnviar(false)}
        title="Enviar POP para ciência"
        footer={
          <>
            <button onClick={() => setModalEnviar(false)} className="btn-secondary">Cancelar</button>
            <button onClick={enviarCiencia} className="btn-primary">Enviar notificação</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">POP a ser enviado</label>
            <select className="input" value={popSelecionado} onChange={e => setPopSelecionado(e.target.value)}>
              <option value="">Selecione um POP</option>
              {mockPOPs.filter(p => p.status === 'ativo').map(p => (
                <option key={p.id} value={p.id}>{p.titulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Colaboradores</label>
            <div className="space-y-2">
              {mockColaboradores.map(c => (
                <label key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colaboradoresSel.includes(c.id)}
                    onChange={() => toggleColab(c.id)}
                    className="rounded"
                  />
                  <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-600">
                    {c.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.nome}</p>
                    <p className="text-xs text-gray-400">{c.cargo}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            Os colaboradores receberão um link por WhatsApp/email para assinar a ciência com registro de IP, data e dispositivo.
          </div>
        </div>
      </Modal>

      {/* Modal Simular Assinatura */}
      <Modal
        open={!!modalCiencia}
        onClose={() => setModalCiencia(null)}
        title="Confirmar ciência do POP"
        footer={
          <>
            <button onClick={() => setModalCiencia(null)} className="btn-secondary">Cancelar</button>
            <button
              onClick={() => assinarCiencia(modalCiencia?.id)}
              disabled={!assinado}
              className={`btn-primary ${!assinado ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Assinar digitalmente
            </button>
          </>
        }
      >
        {modalCiencia && (
          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">POP</p>
              <p className="font-medium text-gray-900">{modalCiencia.popTitulo}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
              <strong>Resumo do procedimento:</strong><br />
              Este procedimento estabelece as etapas obrigatórias para garantir a conformidade sanitária conforme exigências da ANVISA e RDC 1.002/2025. O colaborador declara ter lido, compreendido e estar apto a executar este procedimento.
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Quiz de verificação</p>
              {['A autoclave deve ser testada com indicador biológico semanalmente?', 'O registro de cada ciclo deve ser arquivado?'].map((q, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 mb-2">{q}</p>
                  <div className="flex gap-3">
                    {['Sim', 'Não'].map(op => (
                      <label key={op} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={`q${i}`}
                          value={op}
                          onChange={() => setQuizResp(r => ({...r, [i]: op}))}
                        />
                        <span className="text-xs">{op}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={assinado} onChange={e => setAssinado(e.target.checked)} />
              <span className="text-xs text-gray-600 leading-relaxed">
                Declaro que li e compreendi o conteúdo completo deste POP e estou ciente das minhas responsabilidades. Esta assinatura digital tem validade jurídica.
              </span>
            </label>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
              Será registrado: IP real, data/hora, dispositivo e resultado do quiz como evidência jurídica.
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
