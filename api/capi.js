const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
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
      'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2);

    // IP
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress;

    // User Agent
    const userAgent = req.headers['user-agent'];

    // Leer cookies
    const cookieHeader = req.headers.cookie || '';

    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      const key = parts.shift();

      if (key) {
        cookies[key] = decodeURIComponent(parts.join('=') || '');
      }
    });

    const userData = {};

    if (clientIp) {
      userData.client_ip_address = clientIp;
    }

    if (userAgent) {
      userData.client_user_agent = userAgent;
    }

    if (cookies._fbp) {
      userData.fbp = cookies._fbp;
    }

    if (cookies._fbc) {
      userData.fbc = cookies._fbc;
    }

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url:
            req.headers.referer ||
            'https://landing-ganamos-neon.vercel.app/',
          user_data: userData
        }
      ]
    };

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
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
        success: false,
        meta: result
      });
    }

    return res.status(200).json({
      success: true,
      event_id: eventId,
      meta: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
