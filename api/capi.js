module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const PIXEL_ID = '2047092762678031';
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
      return res.status(500).json({
        error: 'Falta META_ACCESS_TOKEN en Vercel'
      });
    }

    const eventId =
      req.query.event_id ||
      req.body?.event_id ||
      'lead_' + Date.now();

    const userAgent = req.headers['user-agent'] || '';

    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress || '';

    // Cookies de Meta si están disponibles
    const cookieHeader = req.headers.cookie || '';

    const getCookie = (name) => {
      const match = cookieHeader.match(
        new RegExp('(?:^|; )' + name + '=([^;]*)')
      );
      return match ? decodeURIComponent(match[1]) : undefined;
    };

    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');

    const userData = {
      client_ip_address: ip,
      client_user_agent: userAgent
    };

    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url:
            'https://landing-ganamos-neon.vercel.app/',
          user_data: userData
        }
      ],

      // SOLO PARA PROBAR EVENTOS
      test_event_code: 'TEST85729'
    };

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(
        ACCESS_TOKEN
      )}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        meta: result
      });
    }

    return res.status(200).json({
      ok: true,
      meta: result
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
