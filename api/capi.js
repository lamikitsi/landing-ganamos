module.exports = async function handler(req, res) {
  // Aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const PIXEL_ID = "2047092762678031";
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({
      error: "META_ACCESS_TOKEN no está configurado"
    });
  }

  const eventId = req.query.event_id || "";

  // Obtener IP real
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : req.socket?.remoteAddress || "";

  // User Agent
  const userAgent = req.headers["user-agent"] || "";

  const eventSourceUrl =
    req.headers.referer ||
    req.headers.origin ||
    "https://landing-ganamos-neon.vercel.app/";

  const userData = {};

  if (clientIp) {
    userData.client_ip_address = clientIp;
  }

  if (userAgent) {
    userData.client_user_agent = userAgent;
  }

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: userData
      }
    ]
  };

  try {
    console.log("CAPI USER DATA:", userData);
    console.log("CAPI EVENT ID:", eventId);

    const response = await fetch(
      `https://graph.facebook.com/v24.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log("META RESPONSE:", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("META ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
};
