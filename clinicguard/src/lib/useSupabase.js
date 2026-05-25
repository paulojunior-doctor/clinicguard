import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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
    // Gerar senha simples: primeiras 3 letras do nome + 4 últimos dígitos do telefone (ou 1234)
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

  const registrar = async (id) => {
    const proxima = new Date()
    proxima.setMonth(proxima.getMonth() + 6)
    const { data } = await supabase.from('obrigacoes')
      .update({ status: 'ok', ultima_data: new Date().toISOString().slice(0,10), proxima_data: proxima.toISOString().slice(0,10) })
      .eq('id', id).select().single()
    if (data) setObrigacoes(prev => prev.map(o => o.id === id ? data : o))
  }

  return { obrigacoes, loading, criar, registrar, refetch: fetch }
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
