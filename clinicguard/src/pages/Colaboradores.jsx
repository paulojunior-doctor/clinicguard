import { useState } from 'react'
import { Plus, Users, Trash2, Loader, Send, Copy, Check, Phone, Mail, Shield } from 'lucide-react'
import { PageHeader, Modal, EmptyState } from '@/components/ui'
import { useColaboradores, usePOPs, useCiencias, useClinicaId } from '@/lib/useSupabase'

const cargos = ['Cirurgião-Dentista', 'Auxiliar de Saúde Bucal', 'Técnico em Saúde Bucal', 'Recepcionista', 'Higienizadora', 'Estagiário(a)', 'Responsável Técnico', 'Outro']

export default function Colaboradores() {
  const clinicaId = useClinicaId()
  const { colaboradores, loading, criar, remover } = useColaboradores(clinicaId)
  const { pops } = usePOPs(clinicaId)
  const { enviar } = useCiencias(clinicaId)

  const [modalNovo, setModalNovo]     = useState(false)
  const [modalEnviar, setModalEnviar] = useState(false)
  const [modalLink, setModalLink]     = useState(null)
  const [salvando, setSalvando]       = useState(false)
  const [enviando, setEnviando]       = useState(false)
  const [copiado, setCopiado]         = useState(false)

  const [novo, setNovo] = useState({ nome: '', cargo: 'Auxiliar de Saúde Bucal', email: '', telefone: '' })
  const [popSel, setPopSel]       = useState('')
  const [colabSel, setColabSel]   = useState([])

  const set = (k, v) => setNovo(f => ({ ...f, [k]: v }))

  const salvarColab = async () => {
    if (!novo.nome.trim()) return
    setSalvando(true)
    await criar(novo)
    setSalvando(false)
    setModalNovo(false)
    setNovo({ nome: '', cargo: 'Auxiliar de Saúde Bucal', email: '', telefone: '' })
  }

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
    alert(`Ciência enviada! Compartilhe o link de assinatura com os colaboradores.`)
  }

  const verLink = (col) => {
    const base = window.location.origin
    const link = `${base}/assinar?colab=${col.id}&clinica=${clinicaId}`
    setModalLink({ col, link })
  }

  const copiarLink = async (link) => {
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const whatsappLink = (col, link) => {
    const msg = encodeURIComponent(
      `Olá ${col.nome.split(' ')[0]}! 👋\n\nVocê tem um POP da *Buccal Odontologia* aguardando sua ciência.\n\nClique no link abaixo, faça login com seu email e assine digitalmente:\n\n${link}\n\n_Sua senha de acesso: ${col.senha_acesso}_\n\n✅ O processo leva menos de 2 minutos.`
    )
    return `https://wa.me/55${col.telefone?.replace(/\D/g,'')}?text=${msg}`
  }

  const emailLink = (col, link) => {
    const subject = encodeURIComponent('Buccal Odontologia — POP aguardando sua ciência')
    const body = encodeURIComponent(
      `Olá ${col.nome.split(' ')[0]},\n\nVocê tem um Procedimento Operacional Padrão (POP) da Buccal Odontologia aguardando sua ciência digital.\n\nAcesse o link abaixo para ler e assinar:\n${link}\n\nSua senha de acesso: ${col.senha_acesso}\n\nEm caso de dúvidas, entre em contato com o RT.\n\nBuccal Odontologia`
    )
    return `mailto:${col.email}?subject=${subject}&body=${body}`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Colaboradores"
        subtitle="Equipe da Buccal Odontologia"
        action={
          <div className="flex gap-2">
            <button onClick={() => setModalEnviar(true)} className="btn-secondary flex items-center gap-2">
              <Send className="w-4 h-4" /> Enviar para ciência
            </button>
            <button onClick={() => setModalNovo(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo colaborador
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{colaboradores.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Colaboradores ativos</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">{colaboradores.filter(c => c.email).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Com email cadastrado</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{colaboradores.filter(c => c.telefone).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Com WhatsApp</p>
        </div>
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <Loader className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        ) : colaboradores.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum colaborador cadastrado"
            desc="Cadastre os colaboradores para enviar POPs para ciência digital."
            action={<button onClick={() => setModalNovo(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Cadastrar primeiro</button>}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {colaboradores.map(col => (
              <div key={col.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-600 flex-shrink-0">
                  {col.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{col.nome}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{col.cargo}</span>
                    {col.email && <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{col.email}</span>}
                    {col.telefone && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{col.telefone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {col.senha_acesso && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {col.senha_acesso}
                    </span>
                  )}
                  <button onClick={() => verLink(col)} className="text-xs text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <Send className="w-3 h-3" /> Link
                  </button>
                  <button onClick={() => remover(col.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Colaborador */}
      <Modal open={modalNovo} onClose={() => setModalNovo(false)} title="Novo colaborador"
        footer={<><button onClick={() => setModalNovo(false)} className="btn-secondary">Cancelar</button><button onClick={salvarColab} disabled={salvando} className="btn-primary flex items-center gap-2">{salvando ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Salvar</>}</button></>}>
        <div className="space-y-3">
          <div>
            <label className="label">Nome completo *</label>
            <input className="input" placeholder="Ex: Ana Carolina Melo" value={novo.nome} onChange={e => set('nome', e.target.value)} />
          </div>
          <div>
            <label className="label">Cargo</label>
            <select className="input" value={novo.cargo} onChange={e => set('cargo', e.target.value)}>
              {cargos.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" placeholder="colaborador@buccal.com.br" value={novo.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">WhatsApp (com DDD)</label>
            <input className="input" placeholder="(62) 99999-9999" value={novo.telefone} onChange={e => set('telefone', e.target.value)} />
          </div>
          <div className="bg-brand-50 rounded-lg p-3 text-xs text-brand-700">
            A senha de acesso será gerada automaticamente com as 3 primeiras letras do nome + 1234. Você pode alterar depois.
          </div>
        </div>
      </Modal>

      {/* Modal Enviar para Ciência */}
      <Modal open={modalEnviar} onClose={() => setModalEnviar(false)} title="Enviar POP para ciência"
        footer={<><button onClick={() => setModalEnviar(false)} className="btn-secondary">Cancelar</button><button onClick={enviarCiencia} disabled={enviando || !popSel || colabSel.length === 0} className="btn-primary flex items-center gap-2">{enviando ? <Loader className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Enviar</>}</button></>}>
        <div className="space-y-4">
          <div>
            <label className="label">POP a ser enviado</label>
            <select className="input" value={popSel} onChange={e => setPopSel(e.target.value)}>
              <option value="">Selecione um POP</option>
              {pops.filter(p => p.status === 'ativo').map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Colaboradores</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
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
          </div>
        </div>
      </Modal>

      {/* Modal Link de Assinatura */}
      <Modal open={!!modalLink} onClose={() => setModalLink(null)} title="Link de assinatura"
        footer={<button onClick={() => setModalLink(null)} className="btn-secondary">Fechar</button>}>
        {modalLink && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Colaborador</p>
              <p className="text-sm font-medium text-gray-900">{modalLink.col.nome}</p>
              <p className="text-xs text-gray-500">{modalLink.col.cargo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Link de acesso</p>
              <div className="flex gap-2">
                <input className="input text-xs font-mono" readOnly value={modalLink.link} />
                <button onClick={() => copiarLink(modalLink.link)} className="btn-secondary flex items-center gap-1 whitespace-nowrap">
                  {copiado ? <><Check className="w-4 h-4 text-green-500" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <p className="font-medium text-gray-700 mb-1">Senha de acesso</p>
              <p className="font-mono text-brand-600 text-base">{modalLink.col.senha_acesso}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {modalLink.col.telefone && (
                <a href={whatsappLink(modalLink.col, modalLink.link)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                  <Phone className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {modalLink.col.email && (
                <a href={emailLink(modalLink.col, modalLink.link)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
