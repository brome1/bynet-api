export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Se for uma requisição OPTIONS, retorna OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verifica se é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Recebe os dados do webhook
    const webhookData = req.body;

    // Aqui você pode adicionar sua lógica para processar o webhook
    // Por exemplo, salvar em um banco de dados, enviar email, etc.
    console.log('Webhook recebido:', webhookData);

    // Retorna sucesso
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ error: error.message });
  }
} 