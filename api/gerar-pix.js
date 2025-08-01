// Removido: import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Recebe os dados do body (JSON)
    const {
      name = '',
      email = '',
      cpf = '',
      phone = '',
      externalRef = '',
      street = '',
      streetNumber = '',
      complement = '',
      zipCode = '',
      neighborhood = '',
      city = '',
      state = '',
      country = 'BR',
      title = '',
      unitPrice = 0,
      quantity = 1,
      tangible = false,
      itemExternalRef = '',
      expiresInDays = 1,
      postbackUrl = '',
      metadata = '{}',
      traceable = true,
      ip = '',
    } = req.body;

    // Validação básica
    if (!name || !email || !cpf || !phone || !title || !unitPrice || !postbackUrl) {
      console.error('Parâmetros obrigatórios ausentes:', { name, email, cpf, phone, title, unitPrice, postbackUrl });
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    // Monta o body conforme a documentação da Bynet
    const body = {
      amount: Number(unitPrice) * Number(quantity),
      currency: 'BRL',
      paymentMethod: 'PIX',
      installments: 1,
      postbackUrl,
      metadata,
      traceable,
      ip,
      customer: {
        name,
        email,
        document: {
          number: cpf.replace(/\D/g, ''),
          type: 'CPF',
        },
        phone,
        externalRef,
        address: {
          street,
          streetNumber,
          complement,
          zipCode,
          neighborhood,
          city,
          state,
          country,
        },
      },
      items: [
        {
          title,
          unitPrice: Number(unitPrice),
          quantity: Number(quantity),
          tangible,
          externalRef: itemExternalRef,
        },
      ],
      pix: {
        expiresInDays: Number(expiresInDays),
      },
    };

    // Endpoint e token da Bynet
    const BYNET_URL = process.env.BYNET_URL || 'https://api.bynet.com.br/api/user/transactions';
    const BYNET_API_KEY = process.env.BYNET_API_KEY;

    if (!BYNET_API_KEY) {
      console.error('API KEY da Bynet não configurada.');
      return res.status(500).json({ error: 'API KEY da Bynet não configurada.' });
    }

    console.log('Enviando requisição para Bynet:', BYNET_URL, body);
    // Faz a requisição para a Bynet
    const response = await fetch(BYNET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': BYNET_API_KEY,
        'User-Agent': 'AtivoB2B/1.0',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Resposta da Bynet:', data);

    if (!response.ok) {
      console.error('Erro da Bynet:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao criar transação PIX.' });
    }

    // Retorna os dados relevantes do PIX
    return res.status(200).json({
      status: data.status,
      message: data.message,
      data: data.data,
    });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ error: error.message });
  }
}
