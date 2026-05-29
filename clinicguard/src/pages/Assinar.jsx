import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Shield, CheckCircle, MapPin, Loader, FileText, AlertCircle, Brain, RotateCcw, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const NOTA_MINIMA = 70 // % mínimo para aprovação

// ─── GERAR QUIZ VIA CLAUDE API ────────────────────────────────────────────────
async function gerarQuiz(pop) {
  const conteudo = `
ID: ${pop.id || ''}
Título: ${pop.titulo || ''}
Categoria: ${pop.categoria || ''}
Objetivo: ${pop.objetivo || ''}
Passos: ${JSON.stringify(pop.passos || [])}
Pontos críticos: ${JSON.stringify(pop.pontos_criticos || [])}
  `.trim()

  const prompt = `Você é um especialista em compliance sanitário. Com base neste POP (Procedimento Operacional Padrão), crie exatamente 4 perguntas de múltipla escolha para avaliar se o colaborador compreendeu o conteúdo.

POP:
${conteudo}

Regras:
- Cada pergunta deve ter 4 alternativas (A, B, C, D)
- Apenas 1 alternativa correta por pergunta
- As perguntas devem focar nos pontos mais críticos e obrigatórios do POP
- Linguagem simples e direta
- Inclua pelo menos 1 pergunta sobre o que é PROIBIDO ou o que NÃO deve ser feito

Responda APENAS com JSON válido neste formato exato, sem texto adicional, sem markdown:
{
  "perguntas": [
    {
      "id": 1,
      "texto": "texto da pergunta",
      "alternativas": {
        "A": "texto alternativa A",
        "B": "texto alternativa B", 
        "C": "texto alternativa C",
        "D": "texto alternativa D"
      },
      "correta": "A"
    }
  ]
}`

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const texto = data.content?.[0]?.text || ''
  const clean = texto.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ─── COMPONENTE QUIZ ──────────────────────────────────────────────────────────
function Quiz({ pop, colaborador, onAprovado, onReprovado }) {
  const [carregando, setCarregando] = useState(true)
  const [perguntas, setPerguntas]   = useState([])
  const [respostas, setRespostas]   = useState({})
  const [enviado, setEnviado]       = useState(false)
  const [nota, setNota]             = useState(null)
  const [erro, setErro]             = useState('')
  const [tentativas, setTentativas] = useState(1)

  useEffect(() => { carregarQuiz() }, [])

  async function carregarQuiz() {
    setCarregando(true)
    setErro('')
    try {
      const quiz = await gerarQuiz(pop)
      setPerguntas(quiz.perguntas)
    } catch (e) {
      setErro('Não foi possível gerar o quiz. Tente novamente.')
      console.error(e)
    }
    setCarregando(false)
  }

  function responder(perguntaId, alternativa) {
    if (enviado) return
    setRespostas(prev => ({ ...prev, [perguntaId]: alternativa }))
  }

  function calcularNota() {
    const corretas = perguntas.filter(p => respostas[p.id] === p.correta).length
    return Math.round((corretas / perguntas.length) * 100)
  }

  function enviarQuiz() {
    if (Object.keys(respostas).length < perguntas.length) {
      setErro('Responda todas as perguntas antes de enviar.')
      return
    }
    const n = calcularNota()
    setNota(n)
    setEnviado(true)
    setErro('')
  }

  function tentarNovamente() {
    setRespostas({})
    setEnviado(false)
    setNota(null)
    setTentativas(t => t + 1)
    carregarQuiz()
  }

  function prosseguir() {
    onAprovado({ perguntas, respostas, nota, tentativas })
  }

  // ── Carregando ──
  if (carregando) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-brand-600 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Gerando quiz personalizado...</h2>
        <p className="text-sm text-gray-500">A IA está criando perguntas baseadas no conteúdo do POP</p>
        <div className="mt-4 flex items-center justify-center gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )

  // ── Erro ──
  if (erro && !enviado) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-600 mb-4">{erro}</p>
        <button onClick={carregarQuiz} className="btn-primary flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    </div>
  )

  // ── Resultado ──
  if (enviado && nota !== null) {
    const aprovado = nota >= NOTA_MINIMA
    const corretas = perguntas.filter(p => respostas[p.id] === p.correta).length

    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`${aprovado ? 'bg-green-600' : 'bg-red-500'} text-white px-4 py-3 sticky top-0 z-10`}>
          <p className="text-sm font-semibold max-w-2xl mx-auto">
            {aprovado ? '✅ Aprovado! Pode prosseguir' : '❌ Não aprovado — tente novamente'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">

          {/* Score */}
          <div className={`card p-5 text-center border-2 ${aprovado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className={`text-5xl font-bold mb-2 ${aprovado ? 'text-green-600' : 'text-red-500'}`}>
              {nota}%
            </div>
            <p className={`text-sm font-medium ${aprovado ? 'text-green-700' : 'text-red-600'}`}>
              {corretas} de {perguntas.length} corretas · Nota mínima: {NOTA_MINIMA}%
            </p>
            {aprovado
              ? <p className="text-xs text-green-600 mt-2">🎉 Parabéns, {colaborador?.nome.split(' ')[0]}! Você demonstrou conhecimento do POP.</p>
              : <p className="text-xs text-red-500 mt-2">Revise o conteúdo do POP e tente novamente. Tentativa {tentativas} de ∞.</p>
            }
          </div>

          {/* Gabarito */}
          <div className="space-y-3">
            {perguntas.map((p, i) => {
              const resposta  = respostas[p.id]
              const acertou   = resposta === p.correta
              return (
                <div key={p.id} className={`card p-4 border-l-4 ${acertou ? 'border-green-400' : 'border-red-400'}`}>
                  <div className="flex items-start gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${acertou ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900">{p.texto}</p>
                  </div>
                  <div className="space-y-1.5 ml-6">
                    {Object.entries(p.alternativas).map(([letra, texto]) => {
                      const isCorreta  = letra === p.correta
                      const isRespondida = letra === resposta
                      let cls = 'text-gray-500'
                      if (isCorreta) cls = 'text-green-700 font-semibold'
                      if (isRespondida && !isCorreta) cls = 'text-red-600 line-through'
                      return (
                        <div key={letra} className={`text-xs flex items-start gap-1.5 ${cls}`}>
                          <span className="font-bold flex-shrink-0">{letra}.</span>
                          <span>{texto}</span>
                          {isCorreta && <span className="ml-auto text-green-600 flex-shrink-0">✓</span>}
                          {isRespondida && !isCorreta && <span className="ml-auto text-red-500 flex-shrink-0">✗</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ação */}
          {aprovado ? (
            <button onClick={prosseguir}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-800 transition-colors flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" /> Prosseguir para assinatura →
            </button>
          ) : (
            <button onClick={tentarNovamente}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-gray-800 text-white hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Perguntas ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-600 text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Quiz de Avaliação</p>
              <p className="text-xs text-white/70">{pop?.titulo} · Nota mínima: {NOTA_MINIMA}%</p>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(Object.keys(respostas).length / perguntas.length) * 100}%` }} />
          </div>
          <p className="text-xs text-white/60 mt-1">{Object.keys(respostas).length} de {perguntas.length} respondidas</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          <Brain className="w-3.5 h-3.5 inline mr-1.5" />
          Quiz gerado automaticamente com base no conteúdo do POP. Responda todas as perguntas para prosseguir.
        </div>

        {perguntas.map((p, i) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-start gap-2 mb-4">
              <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full flex-shrink-0">
                {i + 1}/{perguntas.length}
              </span>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">{p.texto}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(p.alternativas).map(([letra, texto]) => {
                const selecionado = respostas[p.id] === letra
                return (
                  <button key={letra} onClick={() => responder(p.id, letra)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      selecionado
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50'
                    }`}>
                    <span className={`font-bold flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      selecionado ? 'bg-white text-brand-600' : 'bg-gray-100 text-gray-500'
                    }`}>{letra}</span>
                    <span className="leading-relaxed">{texto}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {erro && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" /> {erro}
          </div>
        )}

        <button
          onClick={enviarQuiz}
          disabled={Object.keys(respostas).length < perguntas.length}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
            Object.keys(respostas).length === perguntas.length
              ? 'bg-brand-600 text-white hover:bg-brand-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          Enviar respostas →
        </button>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Assinar() {
  const [params] = useSearchParams()
  const colabId   = params.get('colab')
  const clinicaId = params.get('clinica')

  const [step, setStep]           = useState('login')
  const [senha, setSenha]         = useState('')
  const [colaborador, setColab]   = useState(null)
  const [ciencias, setCiencias]   = useState([])
  const [popAtual, setPopAtual]   = useState(null)
  const [cienciaAtual, setCienciaAtual] = useState(null)
  const [lido, setLido]           = useState(false)
  const [declarado, setDeclarado] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [geo, setGeo]             = useState(null)
  const [geoErro, setGeoErro]     = useState(false)
  const [erro, setErro]           = useState('')
  const [quizDados, setQuizDados] = useState(null) // resultado do quiz

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

  // Chamado quando colaborador aprova no quiz
  const onQuizAprovado = (dados) => {
    setQuizDados(dados)
    setStep('assinatura')
  }

  const assinar = async () => {
    if (!declarado) return
    setLoading(true)

    let ip = 'desconhecido'
    try {
      const r = await fetch('https://api.ipify.org?format=json')
      const d = await r.json()
      ip = d.ip
    } catch {}

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
        // ── dados do quiz ──
        quiz_perguntas: quizDados?.perguntas || null,
        quiz_respostas: quizDados?.respostas || null,
        quiz_nota: quizDados?.nota || null,
        quiz_aprovado: quizDados ? quizDados.nota >= NOTA_MINIMA : null,
        quiz_tentativas: quizDados?.tentativas || null,
      })
      .eq('id', cienciaAtual.id)

    setLoading(false)

    if (error) {
      setErro('Erro ao registrar assinatura. Tente novamente.')
      return
    }

    const restantes = ciencias.filter(c => c.id !== cienciaAtual.id)
    if (restantes.length > 0) {
      setCiencias(restantes)
      setCienciaAtual(restantes[0])
      setPopAtual(restantes[0].pops)
      setLido(false)
      setDeclarado(false)
      setQuizDados(null)
      setStep('leitura')
    } else {
      setStep('sucesso')
    }
  }

  // ── TELAS ──

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
            <input className="input text-center text-lg tracking-widest" type="password" placeholder="••••••••"
              value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} autoFocus />
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
          {/* Mostrar conteúdo estruturado do POP */}
          {popAtual?.objetivo && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-bold text-blue-700 uppercase mb-1">Objetivo</p>
              <p className="text-xs text-blue-800">{popAtual.objetivo}</p>
            </div>
          )}
          {popAtual?.passos && Array.isArray(popAtual.passos) && popAtual.passos.map((passo, i) => (
            <div key={i} className="mb-3">
              <p className="text-xs font-bold text-gray-700 mb-1">{i + 1}. {passo.etapa}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {passo.procedimento?.map((item, j) => (
                  <li key={j} className="text-xs text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
          ))}
          {popAtual?.pontos_criticos && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
              <p className="text-xs font-bold text-orange-700 uppercase mb-1">⚠️ Pontos Críticos</p>
              <ul className="list-disc list-inside space-y-0.5">
                {popAtual.pontos_criticos.map((pc, i) => (
                  <li key={i} className="text-xs text-orange-800">{pc}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Fallback para POPs com conteúdo em texto simples */}
          {popAtual?.conteudo && (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
              {popAtual.conteudo}
            </pre>
          )}
        </div>

        {/* Aviso sobre quiz */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-4 flex items-start gap-2">
          <Brain className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-purple-800">Quiz obrigatório após leitura</p>
            <p className="text-xs text-purple-600 mt-0.5">Você responderá 4 perguntas sobre este POP. Nota mínima: {NOTA_MINIMA}%. Aprovação necessária para assinar.</p>
          </div>
        </div>

        <label className="flex items-start gap-3 card p-4 cursor-pointer mb-4">
          <input type="checkbox" checked={lido} onChange={e => setLido(e.target.checked)} className="mt-0.5 w-5 h-5 rounded" />
          <span className="text-sm text-gray-700 leading-relaxed">
            Confirmo que li e compreendi integralmente o conteúdo deste Procedimento Operacional Padrão.
          </span>
        </label>

        <button onClick={() => lido && setStep('quiz')} disabled={!lido}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${lido ? 'bg-brand-600 text-white hover:bg-brand-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          Prosseguir para o quiz →
        </button>
      </div>
    </div>
  )

  if (step === 'quiz') return (
    <Quiz
      pop={popAtual}
      colaborador={colaborador}
      onAprovado={onQuizAprovado}
      onReprovado={() => setStep('leitura')}
    />
  )

  if (step === 'assinatura') return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-600 text-white px-4 py-3 sticky top-0 z-10">
        <p className="text-sm font-semibold max-w-2xl mx-auto">Assinatura Digital</p>
      </div>
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Badge de aprovação no quiz */}
        {quizDados && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-800">Quiz concluído com aprovação</p>
              <p className="text-xs text-green-600">Nota: {quizDados.nota}% · {quizDados.tentativas} tentativa(s)</p>
            </div>
          </div>
        )}

        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-2">Dados que serão registrados com sua assinatura:</p>
          <div className="space-y-2">
            {[
              { label: 'Colaborador', value: colaborador?.nome },
              { label: 'POP', value: popAtual?.titulo },
              { label: 'Data e hora', value: new Date().toLocaleString('pt-BR') },
              { label: 'Nota no quiz', value: quizDados ? `${quizDados.nota}% ✓` : 'N/A' },
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

        {geo && <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg"><MapPin className="w-3.5 h-3.5" /> Geolocalização capturada com sucesso</div>}
        {geoErro && <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg"><MapPin className="w-3.5 h-3.5" /> Geolocalização não disponível — assinatura ainda válida</div>}

        <label className="flex items-start gap-3 card p-4 cursor-pointer">
          <input type="checkbox" checked={declarado} onChange={e => setDeclarado(e.target.checked)} className="mt-0.5 w-5 h-5 rounded" />
          <span className="text-sm text-gray-700 leading-relaxed">
            <strong>Declaro</strong> que li, compreendi e estou ciente do conteúdo deste POP, e que tenho ciência das minhas responsabilidades. Esta assinatura digital tem validade jurídica conforme MP 2.200-2/2001.
          </span>
        </label>

        {erro && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"><AlertCircle className="w-4 h-4" /> {erro}</div>}

        <button onClick={assinar} disabled={!declarado || loading}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${declarado ? 'bg-brand-600 text-white hover:bg-brand-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          {loading ? <><Loader className="w-4 h-4 animate-spin" /> Registrando...</> : '✍️ Assinar digitalmente'}
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
          Olá, {colaborador?.nome.split(' ')[0]}! Sua assinatura digital foi registrada com sucesso.
        </p>
        <div className="bg-brand-50 rounded-xl p-4 mt-4 text-xs text-brand-700 text-left space-y-1">
          <p>✓ Assinado em: {new Date().toLocaleString('pt-BR')}</p>
          {quizDados && <p>✓ Quiz: {quizDados.nota}% ({quizDados.tentativas} tentativa{quizDados.tentativas > 1 ? 's' : ''})</p>}
          {geo && <p>✓ Localização registrada</p>}
          <p>✓ Evidência jurídica gerada</p>
        </div>
        <p className="text-xs text-gray-400 mt-4">Você pode fechar esta janela.</p>
      </div>
    </div>
  )
}
