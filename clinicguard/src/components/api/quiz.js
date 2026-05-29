// api/quiz.js — Vercel Serverless Function
// Proxy para a API da Anthropic (evita CORS no browser)

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pop } = req.body

  if (!pop) {
    return res.status(400).json({ error: 'POP data required' })
  }

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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(500).json({ error: 'Anthropic API error', details: data })
    }

    const texto = data.content?.[0]?.text || ''
    const clean = texto.replace(/```json|```/g, '').trim()
    const quiz  = JSON.parse(clean)

    return res.status(200).json(quiz)
  } catch (error) {
    console.error('Quiz generation error:', error)
    return res.status(500).json({ error: 'Failed to generate quiz', message: error.message })
  }
}
