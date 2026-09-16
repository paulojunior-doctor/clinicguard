/**
 * ClinicGuard — Modal de Conferência de Extração por IA
 * Mostra os dados que a IA leu de um documento antes de aplicá-los
 * ao Manual e às Obrigações. Nada é salvo sem confirmação humana.
 * Suporta múltiplos tipos de documento: Controle de Pragas e Resíduos (PGRSS).
 */

import { useState, useEffect } from 'react'

const CLASSIFICACOES_PRAGAS = ['certificado_controle_pragas', 'laudo_controle_pragas', 'comprovante_servico', 'relatorio_controle_pragas']

const CAMPOS_MANUAL_PRAGAS = [
  { chaveExtracao: 'service_company_name',          chaveManual: 'empresa_dedetizacao',   label: 'Empresa de controle de pragas', tipo: 'text' },
  { chaveExtracao: 'service_company_cnpj',           chaveManual: 'cnpj_dedetizacao',      label: 'CNPJ da empresa',               tipo: 'text' },
  { chaveExtracao: 'sanitary_license_number',        chaveManual: 'numero_cesp_pragas',    label: 'Nº do CESP',                    tipo: 'text' },
  { chaveExtracao: 'sanitary_license_expiration',    chaveManual: 'validade_cesp_pragas',  label: 'Validade do CESP',              tipo: 'date' },
  { chaveExtracao: 'execution_date',                 chaveManual: 'ultima_dedetizacao',    label: 'Data da última dedetização',    tipo: 'date' },
  { chaveExtracao: 'recommended_next_intervention',  chaveManual: 'proxima_dedetizacao',   label: 'Data da próxima dedetização',   tipo: 'date' },
  { chaveExtracao: 'recommended_periodicity',        chaveManual: 'periodicidade_pragas',  label: 'Periodicidade informada',       tipo: 'text' },
]
const CAMPOS_CONTEXTO_PRAGAS = [
  { chave: 'document_number', label: 'Nº do documento' },
  { chave: 'contractor_name', label: 'Contratante' },
  { chave: 'responsible_technical_name', label: 'Responsável técnico' },
  { chave: 'service_type', label: 'Tipo de serviço' },
]

const CAMPOS_MANUAL_PGRSS = [
  { chaveExtracao: 'pgrss_responsible_name', chaveManual: 'responsavel_pgrss',     label: 'Responsável pelo PGRSS',     tipo: 'text' },
  { chaveExtracao: 'emission_date',          chaveManual: 'data_emissao_pgrss',    label: 'Data de emissão do PGRSS',   tipo: 'date' },
  { chaveExtracao: 'scheduled_revision_date',chaveManual: 'proxima_revisao_pgrss', label: 'Próxima revisão do PGRSS',   tipo: 'date' },
]
const CAMPOS_CONTEXTO_PGRSS = [
  { chave: 'document_code', label: 'Código do documento' },
  { chave: 'legal_responsible_name', label: 'Responsável legal' },
]

const CAMPOS_MANUAL_CONTRATO = [
  { chaveExtracao: 'waste_company_name',   chaveManual: 'empresa_residuos',      label: 'Empresa coletora de resíduos', tipo: 'text' },
  { chaveExtracao: 'waste_company_cnpj',   chaveManual: 'cnpj_empresa_residuos', label: 'CNPJ da empresa coletora',     tipo: 'text' },
  { chaveExtracao: 'collection_frequency', chaveManual: 'frequencia_coleta',     label: 'Frequência de coleta',         tipo: 'text' },
]
const CAMPOS_CONTEXTO_CONTRATO = [
  { chave: 'document_code', label: 'Nº do contrato' },
  { chave: 'contracting_party_name', label: 'Contratante' },
]

const CAMPOS_CONTEXTO_LAUDO = [
  { chave: 'waste_company_name', label: 'Empresa executora' },
  { chave: 'generator_name', label: 'Gerador do resíduo' },
  { chave: 'report_period', label: 'Período de referência' },
  { chave: 'report_date', label: 'Data do laudo' },
  { chave: 'quantity_kg', label: 'Quantidade (kg)' },
]

const CONFIG_POR_CLASSIFICACAO = {
  certificado_controle_pragas: { camposManual: CAMPOS_MANUAL_PRAGAS, camposContexto: CAMPOS_CONTEXTO_PRAGAS },
  laudo_controle_pragas:       { camposManual: CAMPOS_MANUAL_PRAGAS, camposContexto: CAMPOS_CONTEXTO_PRAGAS },
  comprovante_servico:         { camposManual: CAMPOS_MANUAL_PRAGAS, camposContexto: CAMPOS_CONTEXTO_PRAGAS },
  relatorio_controle_pragas:   { camposManual: CAMPOS_MANUAL_PRAGAS, camposContexto: CAMPOS_CONTEXTO_PRAGAS },
  pgrss_plano:                 { camposManual: CAMPOS_MANUAL_PGRSS, camposContexto: CAMPOS_CONTEXTO_PGRSS },
  contrato_coleta_residuos:    { camposManual: CAMPOS_MANUAL_CONTRATO, camposContexto: CAMPOS_CONTEXTO_CONTRATO },
  laudo_incineracao:           { camposManual: [], camposContexto: CAMPOS_CONTEXTO_LAUDO },
}

function selo(item) {
  if (!item || item.value === null || item.value === undefined || item.value === '') {
    return { emoji: '🔴', texto: 'Não identificado' }
  }
  if (item.confidence >= 0.85) return { emoji: '🟢', texto: 'Encontrado' }
  if (item.confidence >= 0.5) return { emoji: '🟡', texto: 'Conferir' }
  return { emoji: '🔴', texto: 'Baixa confiança' }
}

function normalizarPeriodicidade(valor) {
  if (!valor) return ''
  const v = valor.trim().toLowerCase()
  const mapa = {
    'mensal': 'Mensal', 'mensalmente': 'Mensal',
    'quinzenal': 'Quinzenal', 'trimestral': 'Trimestral',
    'semestral': 'Semestral', 'anual': 'Anual', 'anualmente': 'Anual',
  }
  return mapa[v] || valor.charAt(0).toUpperCase() + valor.slice(1)
}

export default function ConferenciaExtracao({ open, loading, error, resultado, fileName, onClose, onConfirm }) {
  const [campos, setCampos] = useState({})

  const classification = resultado?.classification
  const config = CONFIG_POR_CLASSIFICACAO[classification] || { camposManual: [], camposContexto: [] }

  useEffect(() => {
    if (resultado?.extraction) {
      const iniciais = {}
      config.camposManual.forEach(({ chaveExtracao, chaveManual }) => {
        let v = resultado.extraction[chaveExtracao]?.value ?? ''
        if (chaveManual === 'periodicidade_pragas' || chaveManual === 'frequencia_coleta') v = normalizarPeriodicidade(v)
        iniciais[chaveManual] = v
      })
      setCampos(iniciais)
    }
  }, [resultado])

  if (!open) return null

  const naoRelacionado = classification === 'documento_nao_relacionado'
  const ficticio = resultado?.extraction?.document_is_test_or_fictitious?.value === true
  const semCamposParaManual = config.camposManual.length === 0

  return (
    <div style={ov.backdrop} onClick={onClose}>
      <div style={ov.modal} onClick={(e) => e.stopPropagation()}>
        <div style={ov.header}>
          <div>
            <div style={ov.title}>Revisar informações encontradas</div>
            <div style={ov.subtitle}>{fileName}</div>
          </div>
          <button style={ov.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={ov.body}>
          {loading && (
            <div style={ov.centerMsg}>
              <div style={ov.spinner} />
              <p>Analisando documento com IA...</p>
            </div>
          )}

          {!loading && error && (
            <div style={ov.centerMsg}>
              <p style={{ color: '#c8692a', fontWeight: 500 }}>Não foi possível extrair informações deste documento.</p>
              <p style={{ fontSize: 13, color: '#7a7870', marginTop: 6 }}>{error}</p>
              <p style={{ fontSize: 13, color: '#7a7870', marginTop: 6 }}>O documento permanece armazenado no Cofre Digital. Nenhum dado foi alterado.</p>
            </div>
          )}

          {!loading && !error && naoRelacionado && (
            <div style={ov.centerMsg}>
              <p style={{ fontWeight: 500 }}>Documento não reconhecido para a categoria selecionada.</p>
              <p style={{ fontSize: 13, color: '#7a7870', marginTop: 6 }}>Nenhuma informação foi alterada.</p>
            </div>
          )}

          {!loading && !error && resultado && !naoRelacionado && (
            <>
              {ficticio && (
                <div style={ov.banner}>🧪 DOCUMENTO DE TESTE — não constitui evidência real de conformidade</div>
              )}

              {config.camposContexto.map(({ chave, label }) => {
                const item = resultado.extraction?.[chave]
                if (!item?.value) return null
                return (
                  <div key={chave} style={ov.contextoRow}>
                    <span style={ov.contextoLabel}>{label}:</span> {typeof item.value === 'string' || typeof item.value === 'number' ? item.value : JSON.stringify(item.value)}
                  </div>
                )
              })}

              {semCamposParaManual ? (
                <div style={ov.infoSemCampos}>
                  Este documento não atualiza campos do Manual diretamente — ele fica registrado como histórico e evidência.
                </div>
              ) : (
                <>
                  <div style={ov.divider} />
                  {config.camposManual.map(({ chaveExtracao, chaveManual, label, tipo }) => {
                    const item = resultado.extraction?.[chaveExtracao]
                    const s = selo(item)
                    return (
                      <div key={chaveManual} style={ov.campoRow}>
                        <div style={ov.campoLabel}>
                          {s.emoji} {label} <span style={ov.confTexto}>· {s.texto}</span>
                        </div>
                        <input
                          type={tipo}
                          value={campos[chaveManual] || ''}
                          onChange={(e) => setCampos(prev => ({ ...prev, [chaveManual]: e.target.value }))}
                          style={ov.input}
                          placeholder="Não identificado — preencha manualmente se souber"
                        />
                      </div>
                    )
                  })}
                </>
              )}

              {classification === 'certificado_controle_pragas' && !campos.proxima_dedetizacao && !campos.periodicidade_pragas && (
                <div style={ov.warnBox}>
                  ⚠️ Próxima intervenção não identificada. Você pode preencher manualmente acima, ou confirmar assim mesmo — a obrigação não será criada automaticamente sem essa informação.
                </div>
              )}
              {classification === 'pgrss_plano' && !campos.proxima_revisao_pgrss && (
                <div style={ov.warnBox}>
                  ⚠️ Data de revisão não identificada. A obrigação de revisão do PGRSS não será criada automaticamente sem essa informação.
                </div>
              )}
            </>
          )}
        </div>

        <div style={ov.footer}>
          <button style={ov.btnGhost} onClick={onClose}>Cancelar</button>
          {!loading && !error && resultado && !naoRelacionado && (
            <button style={ov.btnPrimary} onClick={() => onConfirm(campos, resultado)}>
              Confirmar e atualizar ClinicGuard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const ov = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(26,25,22,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 },
  modal: { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px', borderBottom: '1px solid #f0ede8' },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: '#1a1916' },
  subtitle: { fontSize: 12, color: '#7a7870', marginTop: 3 },
  closeBtn: { border: 'none', background: 'transparent', fontSize: 16, cursor: 'pointer', color: '#7a7870' },
  body: { padding: '20px 24px', overflowY: 'auto' },
  centerMsg: { textAlign: 'center', padding: '30px 10px', color: '#1a1916' },
  spinner: { width: 28, height: 28, border: '2px solid #ebe8e2', borderTopColor: '#c8692a', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.7s linear infinite' },
  banner: { background: '#fff8f4', border: '1px solid #e8c5ad', color: '#c8692a', fontSize: 12, fontWeight: 500, padding: '8px 12px', borderRadius: 8, marginBottom: 16 },
  contextoRow: { fontSize: 13, color: '#4a4842', marginBottom: 6 },
  contextoLabel: { color: '#7a7870' },
  divider: { height: 1, background: '#f0ede8', margin: '14px 0' },
  campoRow: { marginBottom: 14 },
  campoLabel: { fontSize: 12, fontWeight: 500, color: '#1a1916', marginBottom: 5 },
  confTexto: { fontWeight: 400, color: '#aaa8a2' },
  input: { width: '100%', height: 38, border: '1px solid #dedad4', borderRadius: 8, padding: '0 12px', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  warnBox: { background: '#fff8f4', border: '1px solid #e8c5ad', color: '#8a5a30', fontSize: 12, padding: '10px 12px', borderRadius: 8, marginTop: 4 },
  infoSemCampos: { background: '#f0f4ff', border: '1px solid #c8d4f0', color: '#3a4a7a', fontSize: 12, padding: '10px 12px', borderRadius: 8, marginTop: 4 },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #f0ede8' },
  btnGhost: { height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #dedad4', background: 'transparent', color: '#7a7870', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  btnPrimary: { height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#1a1916', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
}