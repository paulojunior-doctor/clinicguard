export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { pop } = req.body
  if (!pop) {
    return res.status(400).json({ error: 'POP não fornecido' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada' })
  }

  // Montar resumo do POP para enviar à IA
  const conteudoPOP = `
Título: ${pop.titulo}
Categoria: ${pop.categoria}
Objetivo: ${pop.objetivo || ''}
Abrangência: ${pop.abrangencia || ''}
Responsável: ${pop.responsavel || ''}
Base Legal: ${pop.base_legal || ''}

Passos:
${(pop.passos || []).map((p, i) => `${i + 1}. ${p.etapa}\n${(p.procedimento || []).map(pr => `   - ${pr}`).join('\n')}`).join('\n\n')}

Pontos Críticos:
${(pop.pontos_criticos || []).map(pc => `- ${pc}`).join('\n')}
  `.trim()

  const prompt = `Você é um avaliador de treinamentos de saúde. Com base no POP abaixo, crie exatamente 4 perguntas de múltipla escolha para avaliar se o colaborador compreendeu o conteúdo.

POP:
${conteudoPOP}

Regras:
- 4 perguntas objetivas e diretas
- Cada pergunta tem 4 alternativas: A, B, C, D
- Apenas 1 alternativa correta por pergunta
- Perguntas baseadas nos pontos mais importantes do POP
- Linguagem simples e clara

Responda APENAS com JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código. Formato exato:
{
  "perguntas": [
    {
      "id": "q1",
      "texto": "Texto da pergunta?",
      "alternativas": {
        "A": "Texto alternativa A",
        "B": "Texto alternativa B",
        "C": "Texto alternativa C",
        "D": "Texto alternativa D"
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
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Erro Anthropic:', err)
      return res.status(500).json({ error: 'Erro ao chamar API da IA' })
    }

    const data = await response.json()
    const texto = data.content?.[0]?.text || ''

    let quiz
    try {
      quiz = JSON.parse(texto)
    } catch {
      // Tentar extrair JSON do texto
      const match = texto.match(/\{[\s\S]*\}/)
      if (match) {
        quiz = JSON.parse(match[0])
      } else {
        throw new Error('JSON inválido na resposta da IA')
      }
    }

    return res.status(200).json(quiz)
  } catch (error) {
    console.error('Erro ao gerar quiz:', error)
    return res.status(500).json({ error: 'Erro interno ao gerar quiz' })
  }
}
