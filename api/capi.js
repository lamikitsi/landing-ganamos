module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const PIXEL_ID = '2047092762678031';
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'META_ACCESS_TOKEN no está configurado'
    });
  }

  const eventId = req.query.event_id || '';

  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.socket?.remoteAddress || '';

  const userData = {
    client_ip_address: clientIp,
    client_user_agent: req.headers['user-agent'] || ''
  };

  // Cookies de Meta enviadas desde el index
  if (req.body?.fbp) {
    userData.fbp = req.body.fbp;
  }

  if (req.body?.fbc) {
    userData.fbc = req.body.fbc;
  }

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: req.headers.referer || '',
        user_data: userData
      }
    ],

    // SOLO PARA PROBAR EN "PROBAR EVENTOS"
    test_event_code: 'TEST85729'
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log('META RESPONSE:', data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('META ERROR:', error);

    return res.status(500).json({
      error: error.message
    });
  }
};
