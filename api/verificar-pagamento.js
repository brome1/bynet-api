import path from 'path';

export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Se for uma requisição OPTIONS, retorna OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verifica se é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { hash } = req.query;

    if (!hash) {
      console.error('Hash não informado');
      return res.status(400).json({ error: 'Hash não informado' });
    }

    // Endpoint e token da Bynet
    const BYNET_URL = process.env.BYNET_URL || 'https://api.bynet.com.br/api/user/transactions';
    const BYNET_API_KEY = process.env.BYNET_API_KEY;

    if (!BYNET_API_KEY) {
      console.error('API KEY da Bynet não configurada.');
      return res.status(500).json({ error: 'API KEY da Bynet não configurada.' });
    }

    console.log('Consultando transação na Bynet:', `${BYNET_URL}/${hash}`);
    // Faz a requisição para a Bynet
    const response = await fetch(`${BYNET_URL}/${hash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': BYNET_API_KEY,
        'User-Agent': 'AtivoB2B/1.0',
      },
    });

    const data = await response.json();
    console.log('Resposta da Bynet:', data);

    if (!response.ok) {
      console.error('Erro da Bynet:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao consultar transação.' });
    }

    // Retorna o status e os dados da transação
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
