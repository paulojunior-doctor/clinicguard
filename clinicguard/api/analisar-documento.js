// api/analisar-documento.js
// Recebe um PDF (base64) do Cofre Digital, classifica e extrai dados
// estruturados de certificados de Controle de Pragas e Vetores.
// Segue o mesmo padrão de chamada à Anthropic usado em api/quiz.js.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { pdfBase64, fileName } = req.body
  if (!pdfBase64) {
    return res.status(400).json({ error: 'PDF não fornecido' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada' })
  }

  const prompt = `Você está analisando um documento enviado ao Cofre Digital do ClinicGuard, um sistema de compliance sanitário para clínicas odontológicas brasileiras.

TAREFA 1 — CLASSIFICAÇÃO
Primeiro, identifique se o documento é um dos seguintes tipos:
- certificado de controle de pragas
- laudo de controle de pragas
- comprovante de serviço de dedetização/desinsetização/desratização
- relatório de controle de pragas
- documento não relacionado a controle de pragas

TAREFA 2 — EXTRAÇÃO (somente se a classificação for um dos 4 primeiros tipos)
Extraia exatamente estes campos, cada um como objeto {"value": ..., "confidence": 0.0 a 1.0, "source": "document"}:

- document_type
- document_number
- execution_date (data em que o serviço foi executado, formato YYYY-MM-DD)
- contractor_name (nome da clínica contratante)
- contractor_cnpj
- service_company_name (empresa que executou o serviço)
- service_company_cnpj
- sanitary_license_number (nº do CESP ou licença sanitária da empresa)
- sanitary_license_expiration (formato YYYY-MM-DD)
- responsible_technical_name
- responsible_technical_registration
- service_type
- treated_areas (array de strings)
- procedures (array de strings)
- products (array de objetos {commercial_name, active_ingredient, registration, application})
- observed_condition
- recommended_next_intervention (data da próxima intervenção, formato YYYY-MM-DD, SOMENTE se estiver expressamente escrita no documento)
- recommended_periodicity (SOMENTE se estiver expressamente escrita no documento — ex: "semestral", "trimestral". NUNCA assuma periodicidade padrão.)
- document_is_test_or_fictitious (true se o documento contiver expressões como "FICTÍCIO" ou "MATERIAL DE TESTE")

REGRAS ABSOLUTAS — NÃO INVENÇÃO:
- Se um campo não estiver identificável no documento, seu "value" deve ser null e "confidence" deve ser 0.
- NUNCA calcule uma data de validade ou próxima intervenção que não esteja expressamente escrita no documento.
- NUNCA assuma periodicidade semestral (ou qualquer outra) por conhecimento externo — só se estiver escrita no documento.
- NUNCA tente deduzir um CNPJ ou número de licença.

Nome do arquivo enviado: "${fileName || 'documento.pdf'}"

Responda APENAS com JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código. Formato exato:
{
  "classification": "certificado_controle_pragas" | "laudo_controle_pragas" | "comprovante_servico" | "relatorio_controle_pragas" | "documento_nao_relacionado",
  "classification_confidence": 0.0,
  "extraction": { ...campos acima, ou null se classification for "documento_nao_relacionado" ... }
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
        model: 'claude-sonnet-5',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Erro Anthropic:', err)
      return res.status(500).json({ error: 'Erro ao chamar API da IA' })
    }

    const data = await response.json()
    const texto = data.content?.[0]?.text || ''

    let resultado
    try {
      resultado = JSON.parse(texto)
    } catch {
      const match = texto.match(/\{[\s\S]*\}/)
      if (match) {
        resultado = JSON.parse(match[0])
      } else {
        throw new Error('JSON inválido na resposta da IA')
      }
    }

    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Erro ao analisar documento:', error)
    return res.status(500).json({ error: 'Erro ao analisar documento: ' + error.message })
  }
}