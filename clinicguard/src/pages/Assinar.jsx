import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Shield, CheckCircle, MapPin, Loader, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Assinar() {
  const [params] = useSearchParams()
  const colabId  = params.get('colab')
  const clinicaId = params.get('clinica')

  const [step, setStep]         = useState('login') // login | leitura | assinatura | sucesso | erro
  const [senha, setSenha]       = useState('')
  const [colaborador, setColab] = useState(null)
  const [ciencias, setCiencias] = useState([])
  const [popAtual, setPopAtual] = useState(null)
  const [cienciaAtual, setCienciaAtual] = useState(null)
  const [lido, setLido]         = useState(false)
  const [declarado, setDeclarado] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [geo, setGeo]           = useState(null)
  const [geoErro, setGeoErro]   = useState(false)
  const [erro, setErro]         = useState('')

  // Solicitar geolocalização ao carregar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGeoErro(true),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setGeoErro(true)
    }
  }, [])

  const login = async () => {
    if (!senha.trim()) return
    setLoading(true)
    setErro('')

    const { data: col, error } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', colabId)
      .eq('clinica_id', clinicaId)
      .eq('senha_acesso', senha.trim().toLowerCase())
      .single()

    if (error || !col) {
      setErro('Senha incorreta. Verifique com o RT.')
      setLoading(false)
      return
    }

    setColab(col)

    // Buscar ciências pendentes deste colaborador
    const { data: cis } = await supabase
      .from('ciencias')
      .select('*, pops(*)')
      .eq('colaborador_id', colabId)
      .eq('clinica_id', clinicaId)
      .eq('assinado', false)

    setLoading(false)

    if (!cis || cis.length === 0) {
      setStep('semPendencias')
      return
    }

    setCiencias(cis)
    const primeira = cis[0]
    setCienciaAtual(primeira)
    setPopAtual(primeira.pops)
    setStep('leitura')
  }

  const assinar = async () => {
    if (!declarado) return
    setLoading(true)

    // Buscar IP público
    let ip = 'desconhecido'
    try {
      const r = await fetch('https://api.ipify.org?format=json')
      const d = await r.json()
      ip = d.ip
    } catch {}

    // Endereço geográfico reverso (se tiver geo)
    let endereco = geoErro ? 'Geolocalização não autorizada' : 'Obtendo endereço...'
    if (geo) {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${geo.lat}&lon=${geo.lng}&format=json`)
        const d = await r.json()
        endereco = d.display_name || `${geo.lat}, ${geo.lng}`
      } catch {
        endereco = `${geo.lat}, ${geo.lng}`
      }
    }

    const agora = new Date().toISOString()
    const dispositivo = navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
    const navegador = navigator.userAgent.split(')')[0].split('(')[1] || 'Desconhecido'

    const { error } = await supabase
      .from('ciencias')
      .update({
        assinado: true,
        data_assinatura: agora,
        ip,
        dispositivo: `${dispositivo} — ${navegador}`,
        latitude: geo?.lat || null,
        longitude: geo?.lng || null,
        endereco_geo: endereco,
        nome_colaborador: colaborador.nome,
      })
      .eq('id', cienciaAtual.id)

    setLoading(false)

    if (error) {
      setErro('Erro ao registrar assinatura. Tente novamente.')
      return
    }

    // Verificar se há mais ciências pendentes
    const restantes = ciencias.filter(c => c.id !== cienciaAtual.id)
    if (restantes.length > 0) {
      setCiencias(restantes)
      setCienciaAtual(restantes[0])
      setPopAtual(restantes[0].pops)
      setLido(false)
      setDeclarado(false)
      setStep('leitura')
    } else {
      setStep('sucesso')
    }
  }

  // ---- TELAS ----

  if (step === 'login') return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Buccal Odontologia</h1>
          <p className="text-sm text-gray-500 mt-1">Ciência de Procedimento Operacional</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-600 mb-4">Digite sua senha de acesso para ver os POPs pendentes de ciência.</p>
          <div className="mb-3">
            <label className="label">Senha de acesso</label>
            <input
              className="input text-center text-lg tracking-widest"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              autoFocus
            />
          </div>
          {erro && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {erro}
            </div>
          )}
          <button onClick={login} disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Entrar'}
          </button>
          {!geo && !geoErro && (
            <p className="text-xs text-amber-600 text-center mt-3 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> Permita a geolocalização para assinatura completa
            </p>
          )}
          {geo && (
            <p className="text-xs text-green-600 text-center mt-3 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> Localização obtida ✓
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (step === 'semPendencias') return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Tudo em dia!</h2>
        <p className="text-gray-500 mt-2">Olá, {colaborador?.nome.split(' ')[0]}! Você não tem POPs pendentes de ciência no momento.</p>
      </div>
    </div>
  )

  if (step === 'leitura') return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-600 text-white px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{popAtual?.titulo}</p>
            <p className="text-xs text-white/70">{colaborador?.nome} — {ciencias.length} POP(s) pendente(s)</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="card p-4 mb-4">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
            {popAtual?.conteudo}
          </pre>
        </div>

        <label className="flex items-start gap-3 card p-4 cursor-pointer mb-4">
          <input type="checkbox" checked={lido} onChange={e => setLido(e.target.checked)} className="mt-0.5 w-5 h-5 rounded" />
          <span className="text-sm text-gray-700 leading-relaxed">
            Confirmo que li e compreendi integralmente o conteúdo deste Procedimento Operacional Padrão.
          </span>
        </label>

        <button
          onClick={() => lido && setStep('assinatura')}
          disabled={!lido}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${lido ? 'bg-brand-600 text-white hover:bg-brand-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Prosseguir para assinatura →
        </button>
      </div>
    </div>
  )

  if (step === 'assinatura') return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-600 text-white px-4 py-3 sticky top-0 z-10">
        <p className="text-sm font-semibold max-w-2xl mx-auto">Assinatura Digital</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-2">Dados que serão registrados com sua assinatura:</p>
          <div className="space-y-2">
            {[
              { label: 'Colaborador', value: colaborador?.nome },
              { label: 'POP', value: popAtual?.titulo },
              { label: 'Data e hora', value: new Date().toLocaleString('pt-BR') },
              { label: 'Localização', value: geo ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : geoErro ? 'Não autorizada' : 'Obtendo...' },
              { label: 'Dispositivo', value: navigator.userAgent.includes('Mobile') ? 'Celular' : 'Computador' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900 text-right max-w-48 truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {geo && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <MapPin className="w-3.5 h-3.5" /> Geolocalização capturada com sucesso
          </div>
        )}
        {geoErro && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            <MapPin className="w-3.5 h-3.5" /> Geolocalização não disponível — assinatura ainda válida
          </div>
        )}

        <label className="flex items-start gap-3 card p-4 cursor-pointer">
          <input type="checkbox" checked={declarado} onChange={e => setDeclarado(e.target.checked)} className="mt-0.5 w-5 h-5 rounded" />
          <span className="text-sm text-gray-700 leading-relaxed">
            <strong>Declaro</strong> que li, compreendi e estou ciente do conteúdo deste POP, e que tenho ciência das minhas responsabilidades. Esta assinatura digital tem validade jurídica conforme MP 2.200-2/2001.
          </span>
        </label>

        {erro && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" /> {erro}
          </div>
        )}

        <button
          onClick={assinar}
          disabled={!declarado || loading}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${declarado ? 'bg-brand-600 text-white hover:bg-brand-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {loading ? <><Loader className="w-4 h-4 animate-spin" /> Registrando assinatura...</> : '✍️ Assinar digitalmente'}
        </button>
      </div>
    </div>
  )

  if (step === 'sucesso') return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Ciência registrada!</h2>
        <p className="text-gray-500 mt-2 leading-relaxed">
          Olá, {colaborador?.nome.split(' ')[0]}! Sua assinatura digital foi registrada com sucesso com data, hora, IP e geolocalização.
        </p>
        <div className="bg-brand-50 rounded-xl p-4 mt-4 text-xs text-brand-700 text-left space-y-1">
          <p>✓ Assinado em: {new Date().toLocaleString('pt-BR')}</p>
          {geo && <p>✓ Localização: {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}</p>}
          <p>✓ Evidência jurídica gerada</p>
        </div>
        <p className="text-xs text-gray-400 mt-4">Você pode fechar esta janela.</p>
      </div>
    </div>
  )
}
