// api/analisar-documento.js
// Recebe um PDF (base64) do Cofre Digital, classifica e extrai dados
// estruturados. Suporta múltiplos tipos de documento via o parâmetro `tipo`:
//   - "controle_pragas": certificados/laudos de controle de pragas
//   - "residuos": PGRSS, contratos de coleta e laudos de incineração
// Segue o padrão de chamada à Anthropic usado em api/quiz.js.

const PROMPT_CONTROLE_PRAGAS = (fileName) => `Você está analisando um documento enviado ao Cofre Digital do ClinicGuard, um sistema de compliance sanitário para clínicas odontológicas brasileiras.

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

Nome do arquivo enviado: "${fileName}"

Responda APENAS com JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código. Não use \`\`\`json nem \`\`\`. Formato exato:
{
  "classification": "certificado_controle_pragas" | "laudo_controle_pragas" | "comprovante_servico" | "relatorio_controle_pragas" | "documento_nao_relacionado",
  "classification_confidence": 0.0,
  "extraction": { ...campos acima, ou null se classification for "documento_nao_relacionado" ... }
}`;

const PROMPT_RESIDUOS = (fileName) => `Você está analisando um documento enviado ao Cofre Digital do ClinicGuard, um sistema de compliance sanitário para clínicas odontológicas brasileiras, relacionado à gestão de Resíduos de Serviços de Saúde (RSS).

TAREFA 1 — CLASSIFICAÇÃO
Identifique qual desses tipos o documento é:
- "pgrss_plano" — o próprio Plano de Gerenciamento de Resíduos de Serviços de Saúde (o documento de política/plano da clínica, geralmente com várias seções numeradas e assinaturas de aprovação)
- "contrato_coleta_residuos" — contrato de prestação de serviço de coleta/transporte/destinação de resíduos com uma empresa especializada
- "laudo_incineracao" — laudo, certificado ou comprovante de incineração/tratamento/destinação final de um lote específico de resíduos, normalmente referente a um período (mês/ano) e uma quantidade
- "documento_nao_relacionado" — não se encaixa em nenhum dos anteriores

TAREFA 2 — EXTRAÇÃO (somente se a classificação for um dos 3 primeiros tipos)
Extraia os campos abaixo que forem aplicáveis ao tipo identificado. Cada campo é um objeto {"value": ..., "confidence": 0.0 a 1.0, "source": "document"}. Campos não aplicáveis ao tipo de documento ou não encontrados devem ter "value": null e "confidence": 0.

Campos gerais:
- document_type
- document_code (código/número do próprio documento, se houver)

Campos de PGRSS (plano):
- pgrss_responsible_name (responsável técnico/gestão do PGRSS)
- legal_responsible_name (responsável legal da clínica)
- emission_date (data de emissão do plano, formato YYYY-MM-DD)
- scheduled_revision_date (data de revisão programada, formato YYYY-MM-DD, SOMENTE se estiver expressamente escrita)

Campos de contrato de coleta:
- waste_company_name (empresa contratada para coleta/destinação)
- waste_company_cnpj
- contracting_party_name (quem contratou o serviço — pode ser a própria clínica ou um terceiro, como o prédio/condomínio)
- contracting_party_cnpj
- collection_frequency (SOMENTE se estiver expressamente escrita no contrato — ex: "mensalmente". NUNCA assuma periodicidade padrão.)

Campos de laudo de incineração:
- waste_company_name (empresa que executou a incineração/tratamento)
- waste_company_cnpj
- generator_name (nome de quem gerou o resíduo tratado neste laudo — pode ser a própria clínica ou um terceiro)
- generator_cnpj
- report_period (período de referência, ex: "07/2026", como está escrito no documento)
- report_date (data de emissão do laudo, formato YYYY-MM-DD, se houver)
- quantity_kg (quantidade em kg, como número, se houver)

- document_is_test_or_fictitious (true se o documento contiver expressões como "FICTÍCIO" ou "MATERIAL DE TESTE")

REGRAS ABSOLUTAS — NÃO INVENÇÃO:
- Se um campo não estiver identificável no documento, "value" deve ser null e "confidence" 0.
- NUNCA calcule uma data de revisão ou periodicidade que não esteja expressamente escrita no documento.
- NUNCA tente deduzir um CNPJ.
- NUNCA extraia CPF, endereço IP, geolocalização ou outros dados pessoais de assinantes presentes em trilhas de auditoria de assinatura eletrônica (ex: relatórios do Autentique/DocuSign). Ignore essas seções completamente.

Nome do arquivo enviado: "${fileName}"

Responda APENAS com JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código. Não use \`\`\`json nem \`\`\`. Formato exato:
{
  "classification": "pgrss_plano" | "contrato_coleta_residuos" | "laudo_incineracao" | "documento_nao_relacionado",
  "classification_confidence": 0.0,
  "extraction": { ...campos acima aplicáveis, ou null se classification for "documento_nao_relacionado" ... }
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { pdfBase64, fileName, tipo } = req.body
  if (!pdfBase64) {
    return res.status(400).json({ error: 'PDF não fornecido' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada' })
  }

  const tipoDocumento = tipo || 'controle_pragas'
  const nomeArquivo = fileName || 'documento.pdf'

  let prompt
  if (tipoDocumento === 'residuos') {
    prompt = PROMPT_RESIDUOS(nomeArquivo)
  } else if (tipoDocumento === 'controle_pragas') {
    prompt = PROMPT_CONTROLE_PRAGAS(nomeArquivo)
  } else {
    return res.status(400).json({ error: `Tipo de documento desconhecido: ${tipoDocumento}` })
  }

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
        max_tokens: 4000,
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
      return res.status(500).json({ error: 'Erro ao chamar API da IA', detalhe: err.slice(0, 1000) })
    }

    const data = await response.json()
    const blocoTexto = (data.content || []).find(b => b.type === 'text')
    const texto = blocoTexto?.text || ''

    if (!texto) {
      console.error('Resposta vazia da IA. Estrutura completa:', JSON.stringify(data))
      return res.status(500).json({
        error: 'Resposta vazia da IA',
        debug_stop_reason: data.stop_reason,
        debug_content_types: (data.content || []).map(b => b.type),
        debug_full: JSON.stringify(data).slice(0, 2000),
      })
    }

    const textoLimpo = texto.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

    let resultado
    try {
      resultado = JSON.parse(textoLimpo)
    } catch {
      const match = textoLimpo.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          resultado = JSON.parse(match[0])
        } catch (e2) {
          console.error('Texto bruto retornado pela IA:', texto)
          return res.status(500).json({
            error: 'JSON inválido na resposta da IA',
            raw: texto.slice(0, 2000),
          })
        }
      } else {
        console.error('Texto bruto retornado pela IA:', texto)
        return res.status(500).json({
          error: 'JSON inválido na resposta da IA',
          raw: texto.slice(0, 2000),
        })
      }
    }

    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Erro ao analisar documento:', error)
    return res.status(500).json({ error: 'Erro ao analisar documento: ' + error.message })
  }
}