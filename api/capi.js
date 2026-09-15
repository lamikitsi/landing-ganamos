export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const PIXEL_ID = '901147982849876'; // 👈 PONÉ TU PIXEL ID
 const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  const event = {
    data: [
      {
        event_name: "Contact",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: req.headers.referer || "",
        user_data: {
          client_ip_address: req.headers['x-forwarded-for'] || "",
          client_user_agent: req.headers['user-agent'] || ""
        }
      }
    ],
    test_event_code: "TEST85729"
};
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
