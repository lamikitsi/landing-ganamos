module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const PIXEL_ID = '2047092762678031';
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
      return res.status(500).json({
        error: 'Falta META_ACCESS_TOKEN'
      });
    }

    const eventId =
      req.query.event_id ||
      (req.body && req.body.event_id);

    if (!eventId) {
      return res.status(400).json({
        error: 'Falta event_id'
      });
    }

    const forwarded = req.headers['x-forwarded-for'];

    const clientIp =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress;

    const userAgent =
      req.headers['user-agent'] || '';

    const fbp =
      req.query.fbp ||
      (req.body && req.body.fbp) ||
      undefined;

    const fbc =
      req.query.fbc ||
      (req.body && req.body.fbc) ||
      undefined;

    const userData = {
      client_ip_address: clientIp,
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
          event_source_url: 'https://landing-ganamos-neon.vercel.app/',
          user_data: userData
        }
      ]
    };

    const response = await fetch(
      `https://graph.facebook.com/v24.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
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
