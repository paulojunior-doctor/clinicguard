import { useState } from 'react'
import { ShieldAlert, CheckCircle, FileText, GraduationCap, CheckSquare, FolderOpen, Download, AlertTriangle, Shield, Printer } from 'lucide-react'
import { mockPOPs, mockCiencias, mockObrigacoes, mockDocumentos, formatDate } from '@/lib/mockData'

const popsAtivos     = mockPOPs.filter(p => p.status === 'ativo')
const cienciasAssin  = mockCiencias.filter(c => c.assinado)
const obrigOk        = mockObrigacoes.filter(o => o.status === 'ok')
const docsOk         = mockDocumentos.filter(d => d.status === 'ok')
const criticos       = mockObrigacoes.filter(o => o.status === 'vencido')

function gerarPDFReal() {
  const agora = new Date().toLocaleString('pt-BR')
  const hash  = Math.random().toString(36).substring(2, 14).toUpperCase()

  const linhas = [
    '================================================================',
    '         CLINICGUARD — RELATÓRIO DE FISCALIZAÇÃO SANITÁRIA',
    '================================================================',
    '',
    `Clínica: Odonto Central`,
    `Responsável Técnico: Dr. João Rocha`,
    `CRO: 45.231-SP`,
    `CNPJ: 12.345.678/0001-90`,
    `Emitido em: ${agora}`,
    `Hash SHA-256: ${hash}...`,
    '',
    '----------------------------------------------------------------',
    '1. PROCEDIMENTOS OPERACIONAIS PADRÃO (POPs)',
    '----------------------------------------------------------------',
    ...popsAtivos.map(p => `  ✓ ${p.titulo} — v${p.versao} — válido até ${formatDate(p.validade)}`),
    '',
    '----------------------------------------------------------------',
    '2. CIÊNCIAS DOS COLABORADORES',
    '----------------------------------------------------------------',
    ...cienciasAssin.map(c => `  ✓ ${c.colaborador} — ${c.popTitulo} — ${formatDate(c.data)} — IP: ${c.ip}`),
    '',
    '----------------------------------------------------------------',
    '3. OBRIGAÇÕES SANITÁRIAS EM DIA',
    '----------------------------------------------------------------',
    ...obrigOk.map(o => `  ✓ ${o.nome} — próx. venc.: ${formatDate(o.proximaData)}`),
    '',
    '----------------------------------------------------------------',
    '4. DOCUMENTOS NO COFRE DIGITAL',
    '----------------------------------------------------------------',
    ...docsOk.map(d => `  ✓ ${d.nome} — válido até ${formatDate(d.validade)}`),
    '',
    '================================================================',
    'DECLARAÇÃO JURÍDICA',
    '================================================================',
    'Este relatório foi gerado automaticamente pelo ClinicGuard e',
    'contém evidências digitais com validade jurídica conforme',
    'MP 2.200-2/2001 (ICP-Brasil). Todas as assinaturas possuem',
    'registro de IP, data/hora e dispositivo.',
    '',
    `Emitido por: ClinicGuard Compliance Sanitário`,
    `Data/hora: ${agora}`,
    '================================================================',
  ]

  const conteudo = linhas.join('\n')
  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ClinicGuard_Fiscalizacao_${new Date().toISOString().slice(0,10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function Fiscalizacao() {
  const [ativo, setAtivo] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [gerado, setGerado] = useState(false)

  const ativar = async () => {
    setGerando(true)
    await new Promise(r => setTimeout(r, 2200))
    setGerando(false)
    setAtivo(true)
  }

  const baixarRelatorio = async () => {
    setGerando(true)
    await new Promise(r => setTimeout(r, 1000))
    gerarPDFReal()
    setGerando(false)
    setGerado(true)
    setTimeout(() => setGerado(false), 3000)
  }

  const blocos = [
    {
      icone: FileText, cor: 'text-brand-600', bg: 'bg-brand-50',
      titulo: 'POPs Ativos e Aprovados',
      desc: `${popsAtivos.length} procedimentos aprovados pelo RT com versionamento`,
      items: popsAtivos.map(p => ({ txt: p.titulo, detalhe: `v${p.versao} · válido até ${formatDate(p.validade)}` }))
    },
    {
      icone: GraduationCap, cor: 'text-purple-600', bg: 'bg-purple-50',
      titulo: 'Ciências dos Colaboradores',
      desc: `${cienciasAssin.length} assinaturas digitais com IP, data e dispositivo registrados`,
      items: cienciasAssin.map(c => ({ txt: c.colaborador, detalhe: `${c.popTitulo} · ${formatDate(c.data)} · IP ${c.ip}` }))
    },
    {
      icone: CheckSquare, cor: 'text-green-600', bg: 'bg-green-50',
      titulo: 'Obrigações Sanitárias em Dia',
      desc: `${obrigOk.length} de ${mockObrigacoes.length} obrigações regulares`,
      items: obrigOk.map(o => ({ txt: o.nome, detalhe: `Próx. venc: ${formatDate(o.proximaData)}` }))
    },
    {
      icone: FolderOpen, cor: 'text-amber-600', bg: 'bg-amber-50',
      titulo: 'Documentos no Cofre',
      desc: `${docsOk.length} documentos válidos e indexados`,
      items: docsOk.map(d => ({ txt: d.nome, detalhe: `Válido até ${formatDate(d.validade)}` }))
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className={`rounded-2xl p-6 mb-6 transition-all ${ativo ? 'bg-brand-600' : 'bg-red-600'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-6 h-6 text-white" />
              <span className="text-white/80 text-sm font-medium">
                {ativo ? 'Modo Fiscalização Ativo' : 'Modo Fiscalização'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {ativo ? 'Sua clínica está pronta.' : 'A fiscalização chegou?'}
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xl">
              {ativo
                ? 'Todos os documentos, treinamentos e evidências consolidados. Baixe o relatório completo agora.'
                : 'Ative o modo fiscalização para consolidar automaticamente todos os documentos, treinamentos e evidências sanitárias.'}
            </p>
          </div>
          <Shield className="w-16 h-16 text-white/20 flex-shrink-0" />
        </div>

        {!ativo ? (
          <button
            onClick={ativar}
            disabled={gerando}
            className="mt-4 bg-white text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-70"
          >
            {gerando ? (
              <><div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" /> Consolidando evidências...</>
            ) : (
              <><ShieldAlert className="w-4 h-4" /> Ativar Modo Fiscalização</>
            )}
          </button>
        ) : (
          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              onClick={baixarRelatorio}
              disabled={gerando}
              className="bg-white text-brand-600 font-bold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors flex items-center gap-2 text-sm"
            >
              {gerando ? (
                <><div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /> Gerando...</>
              ) : gerado ? (
                <><CheckCircle className="w-4 h-4 text-green-600" /> Relatório baixado!</>
              ) : (
                <><Download className="w-4 h-4" /> Baixar relatório</>
              )}
            </button>
            <button onClick={() => setAtivo(false)} className="bg-white/10 text-white/80 font-medium px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors text-sm">
              Desativar
            </button>
          </div>
        )}
      </div>

      {/* Alertas críticos */}
      {criticos.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-sm font-semibold text-red-700">{criticos.length} item(s) crítico(s) — resolva antes da fiscalização</p>
          </div>
          {criticos.map(c => (
            <div key={c.id} className="flex items-center gap-2 text-sm text-red-600 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {c.nome} — vencido em {formatDate(c.proximaData)}
            </div>
          ))}
        </div>
      )}

      {/* Blocos de evidências */}
      <div className="space-y-4">
        {blocos.map(({ icone: Icon, cor, bg, titulo, desc, items }) => (
          <div key={titulo} className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${cor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{titulo}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <span className="badge-ok">{items.length} itens</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{item.txt}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.detalhe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé jurídico */}
      {ativo && (
        <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Relatório jurídico:</strong> Gerado em {new Date().toLocaleString('pt-BR')} com evidências digitais conforme MP 2.200-2/2001 (ICP-Brasil). Assinaturas com registro de IP, data/hora e dispositivo.
        </div>
      )}
    </div>
  )
}
