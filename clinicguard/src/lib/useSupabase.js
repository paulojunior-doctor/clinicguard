import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const CLINICA_ID_KEY = 'clinicguard_clinica_id'

export async function getOrCreateClinica(nome, rt) {
  const savedId = localStorage.getItem(CLINICA_ID_KEY)
  if (savedId) return savedId
  const { data, error } = await supabase
    .from('clinicas')
    .insert({ nome, responsavel_tecnico: rt })
    .select('id')
    .single()
  if (error) { console.error(error); return null }
  localStorage.setItem(CLINICA_ID_KEY, data.id)
  return data.id
}

export function useClinicaId() {
  return localStorage.getItem(CLINICA_ID_KEY)
}

// ─── HELPER: somar meses a uma data string 'YYYY-MM-DD' ──────────────────────
function somarMeses(dataStr, meses) {
  const d = new Date(dataStr)
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}

// ─── HELPER: somar anos a uma data string ────────────────────────────────────
function somarAnos(dataStr, anos) {
  const d = new Date(dataStr)
  d.setFullYear(d.getFullYear() + anos)
  return d.toISOString().slice(0, 10)
}

// ─── HELPER: subtrair dias de uma data string ────────────────────────────────
function subtrairDias(dataStr, dias) {
  const d = new Date(dataStr)
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

// ─── MAPEAMENTO: campos do Manual → obrigações ───────────────────────────────
// origem: chave única para upsert (nunca duplica)
// proxima_data: calculada a partir do campo
export function gerarObrigacoesDoManual(dados) {
  const obrigacoes = []

  // Licença Sanitária — vence na data informada
  if (dados.validade_licenca) {
    obrigacoes.push({
      origem: 'manual_licenca_sanitaria',
      nome: 'Renovar Licença Sanitária (Alvará Sanitário)',
      categoria: 'Licença',
      periodicidade: 'Anual',
      responsavel: dados.responsavel_tecnico || dados.responsavel_legal || '',
      proxima_data: subtrairDias(dados.validade_licenca, 60), // avisar 60 dias antes
      descricao: `Alvará Sanitário vigente até ${new Date(dados.validade_licenca).toLocaleDateString('pt-BR')}. ⚠️ A renovação deve ser solicitada com antecedência de 30 a 120 dias antes do término da validade — por isso este aviso foi gerado para 60 dias antes do vencimento.`,
    })
  }

  // Dedetização — próxima data informada diretamente
  if (dados.proxima_dedetizacao) {
    obrigacoes.push({
      origem: 'manual_dedetizacao',
      nome: 'Dedetização — Controle de Pragas',
      categoria: 'Controle de Pragas',
      periodicidade: 'Semestral',
      responsavel: dados.empresa_dedetizacao || 'Empresa Licenciada',
      proxima_data: dados.proxima_dedetizacao,
      descricao: `Empresa: ${dados.empresa_dedetizacao || '—'} | CESP nº ${dados.numero_cesp_pragas || '—'}. Frequência mínima semestral (RDC 52/2009). 📋 Certificado: ao fim de cada serviço a dedetizadora deve emitir laudo técnico comprovando execução e produtos utilizados. Este certificado deve estar disponível na clínica para fiscalização da Vigilância Sanitária Municipal, renovado dentro do prazo de garantia do laudo.`,
    })
  } else if (dados.ultima_dedetizacao) {
    // Calcular +6 meses da última
    obrigacoes.push({
      origem: 'manual_dedetizacao',
      nome: 'Dedetização — Controle de Pragas',
      categoria: 'Controle de Pragas',
      periodicidade: 'Semestral',
      responsavel: dados.empresa_dedetizacao || 'Empresa Licenciada',
      proxima_data: somarMeses(dados.ultima_dedetizacao, 6),
      descricao: `Última dedetização: ${new Date(dados.ultima_dedetizacao).toLocaleDateString('pt-BR')}. Empresa: ${dados.empresa_dedetizacao || '—'} | CESP nº ${dados.numero_cesp_pragas || '—'}. Frequência mínima semestral (RDC 52/2009). 📋 Certificado: ao fim de cada serviço a dedetizadora deve emitir laudo técnico comprovando execução e produtos utilizados. Este certificado deve estar disponível na clínica para fiscalização da Vigilância Sanitária Municipal, renovado dentro do prazo de garantia do laudo.`,
    })
  }

  // CESP de pragas — avisar 30 dias antes do vencimento
  if (dados.validade_cesp_pragas) {
    obrigacoes.push({
      origem: 'manual_cesp_pragas',
      nome: 'Renovar CESP — Controle de Pragas',
      categoria: 'Controle de Pragas',
      periodicidade: 'Semestral',
      responsavel: dados.empresa_dedetizacao || 'Empresa Licenciada',
      proxima_data: subtrairDias(dados.validade_cesp_pragas, 30),
      descricao: `CESP nº ${dados.numero_cesp_pragas || '—'} vence em ${new Date(dados.validade_cesp_pragas).toLocaleDateString('pt-BR')}. Solicitar renovação 30 dias antes.`,
    })
  }

  // Limpeza da Caixa d'Água — próxima data ou +6 meses
  if (dados.proxima_limpeza_reservatorio) {
    obrigacoes.push({
      origem: 'manual_limpeza_agua',
      nome: 'Limpeza e Desinfecção da Caixa d\'Água',
      categoria: 'Manutenção',
      periodicidade: 'Semestral',
      responsavel: dados.responsavel_agua || dados.responsavel_tecnico || '',
      proxima_data: dados.proxima_limpeza_reservatorio,
      descricao: `Limpeza semestral obrigatória (Portaria MS 888/2021). Responsável: ${dados.responsavel_agua || '—'}. Coletar amostra microbiológica após a limpeza.`,
    })
  } else if (dados.ultima_limpeza_reservatorio) {
    obrigacoes.push({
      origem: 'manual_limpeza_agua',
      nome: 'Limpeza e Desinfecção da Caixa d\'Água',
      categoria: 'Manutenção',
      periodicidade: 'Semestral',
      responsavel: dados.responsavel_agua || dados.responsavel_tecnico || '',
      proxima_data: somarMeses(dados.ultima_limpeza_reservatorio, 6),
      descricao: `Última limpeza: ${new Date(dados.ultima_limpeza_reservatorio).toLocaleDateString('pt-BR')}. Portaria MS 888/2021.`,
    })
  }

  // Manutenção Autoclave — próxima data ou +6 meses
  if (dados.proxima_manutencao) {
    obrigacoes.push({
      origem: 'manual_manutencao_autoclave',
      nome: 'Manutenção Preventiva Autoclave',
      categoria: 'Esterilização',
      periodicidade: 'Semestral',
      responsavel: dados.empresa_manutencao || 'Empresa Técnica',
      proxima_data: dados.proxima_manutencao,
      descricao: `Empresa de manutenção: ${dados.empresa_manutencao || '—'}. Manutenção semestral obrigatória (RDC 15/2012).`,
    })
  } else if (dados.ultima_manutencao_autoclave) {
    obrigacoes.push({
      origem: 'manual_manutencao_autoclave',
      nome: 'Manutenção Preventiva Autoclave',
      categoria: 'Esterilização',
      periodicidade: 'Semestral',
      responsavel: dados.empresa_manutencao || 'Empresa Técnica',
      proxima_data: somarMeses(dados.ultima_manutencao_autoclave, 6),
      descricao: `Última manutenção: ${new Date(dados.ultima_manutencao_autoclave).toLocaleDateString('pt-BR')}. Empresa: ${dados.empresa_manutencao || '—'}.`,
    })
  }

  // Manutenção Climatizador — filtros mensais
  if (dados.ultima_manutencao_ar) {
    obrigacoes.push({
      origem: 'manual_manutencao_ar',
      nome: 'Limpeza de Filtros — Ar-Condicionado',
      categoria: 'Manutenção',
      periodicidade: 'Mensal',
      responsavel: dados.empresa_manutencao || 'Auxiliar',
      proxima_data: somarMeses(dados.ultima_manutencao_ar, 1),
      descricao: `Limpeza mensal de filtros obrigatória (RE ANVISA 09/2003). Última: ${new Date(dados.ultima_manutencao_ar).toLocaleDateString('pt-BR')}.`,
    })
  }

  // Levantamento Radiométrico — a cada 4 anos
  if (dados.data_levantamento_radiometrico) {
    obrigacoes.push({
      origem: 'manual_radiometrico',
      nome: 'Renovar Laudo Radiométrico',
      categoria: 'Manutenção',
      periodicidade: 'Anual',
      responsavel: dados.supervisor_radiologico || dados.responsavel_tecnico || '',
      proxima_data: subtrairDias(somarAnos(dados.data_levantamento_radiometrico, 4), 60),
      descricao: `Levantamento radiométrico realizado em ${new Date(dados.data_levantamento_radiometrico).toLocaleDateString('pt-BR')}. Deve ser atualizado a cada 4 anos ou quando houver modificação do equipamento/área (Art. 141 — RDC 1.002/2025). Empresa: ${dados.empresa_radiometrico || '—'}.`,
    })
  }

  // CESP de Resíduos — avisar 30 dias antes
  if (dados.validade_cesp) {
    obrigacoes.push({
      origem: 'manual_cesp_residuos',
      nome: 'Renovar CESP — Coleta de Resíduos',
      categoria: 'Resíduos',
      periodicidade: 'Semestral',
      responsavel: dados.empresa_residuos || 'Empresa Coletora',
      proxima_data: subtrairDias(dados.validade_cesp, 30),
      descricao: `CESP da empresa ${dados.empresa_residuos || '—'} (CNPJ: ${dados.cnpj_empresa_residuos || '—'}) vence em ${new Date(dados.validade_cesp).toLocaleDateString('pt-BR')}. Solicitar renovação 30 dias antes.`,
    })
  }

  return obrigacoes
}

// POPs
export function usePOPs(clinicaId) {
  const [pops, setPops]       = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!clinicaId) return
    setLoading(true)
    const { data } = await supabase
      .from('pops').select('*').eq('clinica_id', clinicaId).order('created_at', { ascending: false })
    setPops(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [clinicaId])

  const criar = async (pop) => {
    const { data } = await supabase.from('pops').insert({ ...pop, clinica_id: clinicaId }).select().single()
    if (data) setPops(prev => [data, ...prev])
    return data
  }

  const aprovar = async (id, aprovadoPor) => {
    const { data } = await supabase.from('pops')
      .update({ status: 'ativo', aprovado_por: aprovadoPor, aprovado_em: new Date().toISOString() })
      .eq('id', id).select().single()
    if (data) setPops(prev => prev.map(p => p.id === id ? data : p))
  }

  const remover = async (id) => {
    await supabase.from('pops').delete().eq('id', id)
    setPops(prev => prev.filter(p => p.id !== id))
  }

  return { pops, loading, criar, aprovar, remover, refetch: fetch }
}

// Colaboradores
export function useColaboradores(clinicaId) {
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading]             = useState(true)

  const fetch = async () => {
    if (!clinicaId) return
    setLoading(true)
    const { data } = await supabase
      .from('colaboradores').select('*').eq('clinica_id', clinicaId).eq('ativo', true).order('nome')
    setColaboradores(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [clinicaId])

  const criar = async (col) => {
    const avatar = col.nome.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
    const senha = col.nome.split(' ')[0].toLowerCase().slice(0,3) + '1234'
    const { data } = await supabase
      .from('colaboradores')
      .insert({ ...col, avatar, senha_acesso: senha, clinica_id: clinicaId })
      .select().single()
    if (data) setColaboradores(prev => [...prev, data].sort((a,b) => a.nome.localeCompare(b.nome)))
    return data
  }

  const remover = async (id) => {
    await supabase.from('colaboradores').update({ ativo: false }).eq('id', id)
    setColaboradores(prev => prev.filter(c => c.id !== id))
  }

  return { colaboradores, loading, criar, remover, refetch: fetch }
}

// Obrigações
export function useObrigacoes(clinicaId) {
  const [obrigacoes, setObrigacoes] = useState([])
  const [loading, setLoading]       = useState(true)

  const fetch = async () => {
    if (!clinicaId) return
    setLoading(true)
    const { data } = await supabase
      .from('obrigacoes').select('*').eq('clinica_id', clinicaId).order('proxima_data')
    setObrigacoes(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [clinicaId])

  const criar = async (ob) => {
    const { data } = await supabase.from('obrigacoes').insert({ ...ob, clinica_id: clinicaId }).select().single()
    if (data) setObrigacoes(prev => [...prev, data])
    return data
  }

  // ── NOVO: upsert por origem (usado pelo Manual) ────────────────────────────
  const upsertPorOrigem = async (ob) => {
    // Verificar se já existe obrigação com esta origem para esta clínica
    const { data: existente } = await supabase
      .from('obrigacoes')
      .select('id')
      .eq('clinica_id', clinicaId)
      .eq('origem', ob.origem)
      .single()

    let data
    if (existente) {
      // Atualizar existente
      const { data: updated } = await supabase
        .from('obrigacoes')
        .update({
          nome: ob.nome,
          categoria: ob.categoria,
          periodicidade: ob.periodicidade,
          responsavel: ob.responsavel,
          proxima_data: ob.proxima_data,
          descricao: ob.descricao,
        })
        .eq('id', existente.id)
        .select()
        .single()
      data = updated
    } else {
      // Criar novo
      const { data: created } = await supabase
        .from('obrigacoes')
        .insert({ ...ob, clinica_id: clinicaId })
        .select()
        .single()
      data = created
    }

    if (data) {
      setObrigacoes(prev => {
        const existe = prev.find(o => o.origem === ob.origem)
        if (existe) return prev.map(o => o.origem === ob.origem ? data : o)
        return [...prev, data]
      })
    }
    return data
  }

  // ── NOVO: sincronizar todas as obrigações geradas pelo Manual ─────────────
  const sincronizarDoManual = async (dadosManual) => {
    const obrigacoesGeradas = gerarObrigacoesDoManual(dadosManual)
    const resultados = await Promise.all(
      obrigacoesGeradas.map(ob => upsertPorOrigem(ob))
    )
    return resultados.filter(Boolean)
  }

  const registrar = async (id, extras = {}) => {
    const ob = obrigacoes.find(o => o.id === id)
    const proxima = calcularProximaData(ob?.periodicidade)
    const { data } = await supabase.from('obrigacoes')
      .update({
        status: 'ok',
        ultima_data: extras.data_execucao || new Date().toISOString().slice(0, 10),
        proxima_data: proxima,
        executante:           extras.executante           || null,
        observacoes_registro: extras.observacoes_registro || null,
        comprovante_url:      extras.comprovante_url      || null,
        comprovante_nome:     extras.comprovante_nome     || null,
      })
      .eq('id', id).select().single()
    if (data) setObrigacoes(prev => prev.map(o => o.id === id ? data : o))
  }

  return { obrigacoes, loading, criar, registrar, upsertPorOrigem, sincronizarDoManual, refetch: fetch }
}

// ── HELPER: calcular próxima data por periodicidade ──────────────────────────
function calcularProximaData(periodicidade) {
  const hoje = new Date()
  switch (periodicidade) {
    case 'Semanal':      hoje.setDate(hoje.getDate() + 7);    break
    case 'Quinzenal':    hoje.setDate(hoje.getDate() + 15);   break
    case 'Mensal':       hoje.setMonth(hoje.getMonth() + 1);  break
    case 'Trimestral':   hoje.setMonth(hoje.getMonth() + 3);  break
    case 'Semestral':    hoje.setMonth(hoje.getMonth() + 6);  break
    case 'Anual':        hoje.setFullYear(hoje.getFullYear() + 1); break
    default:             hoje.setMonth(hoje.getMonth() + 6);  break
  }
  return hoje.toISOString().slice(0, 10)
}

// Documentos
export function useDocumentos(clinicaId) {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading]       = useState(true)

  const fetch = async () => {
    if (!clinicaId) return
    setLoading(true)
    const { data } = await supabase
      .from('documentos').select('*').eq('clinica_id', clinicaId).order('created_at', { ascending: false })
    setDocumentos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [clinicaId])

  const criar = async (doc) => {
    const { data } = await supabase.from('documentos').insert({ ...doc, clinica_id: clinicaId }).select().single()
    if (data) setDocumentos(prev => [data, ...prev])
    return data
  }

  const remover = async (id) => {
    await supabase.from('documentos').delete().eq('id', id)
    setDocumentos(prev => prev.filter(d => d.id !== id))
  }

  return { documentos, loading, criar, remover, refetch: fetch }
}

// Ciências
export function useCiencias(clinicaId) {
  const [ciencias, setCiencias] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetch = async () => {
    if (!clinicaId) return
    setLoading(true)
    const { data } = await supabase
      .from('ciencias')
      .select('*, pops(titulo, categoria), colaboradores(nome, cargo, avatar)')
      .eq('clinica_id', clinicaId)
      .order('created_at', { ascending: false })
    setCiencias(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [clinicaId])

  const enviar = async (popId, colaboradorIds) => {
    const registros = colaboradorIds.map(colId => ({
      pop_id: popId,
      colaborador_id: colId,
      clinica_id: clinicaId,
      assinado: false,
    }))
    const { data } = await supabase.from('ciencias').insert(registros).select()
    if (data) setCiencias(prev => [...data, ...prev])
    return data
  }

  return { ciencias, loading, enviar, refetch: fetch }
}

