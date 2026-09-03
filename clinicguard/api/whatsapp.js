export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { telefone, mensagem } = req.body
  if (!telefone || !mensagem) {
    return res.status(400).json({ error: 'Telefone ou mensagem não fornecidos' })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM // ex: whatsapp:+14155238886

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({ error: 'Credenciais Twilio não configuradas' })
  }

  // Normaliza telefone para formato internacional (assume Brasil, DDI 55)
  const numeroLimpo = telefone.replace(/\D/g, '')
  const numeroFormatado = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`
  const to = `whatsapp:+${numeroFormatado}`

  try {
    const body = new URLSearchParams({
      From: fromNumber,
      To: to,
      Body: mensagem,
    })

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro Twilio:', data)
      return res.status(response.status).json({
        error: data.message || 'Erro ao enviar mensagem via Twilio',
        code: data.code,
      })
    }

    return res.status(200).json({
      sid: data.sid,
      status: data.status,
      to: data.to,
    })
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
    return res.status(500).json({ error: 'Erro interno ao enviar mensagem' })
  }
}
