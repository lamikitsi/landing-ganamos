
export default async function handler(req, res) {

  const PIXEL_ID = "901147982849876";
  const ACCESS_TOKEN = "EAAcstSz6uP8BQhgqw1MvBmSlUUSUCIEfqZA3CNbQpVZB3uKuAqCCAalbfiAAbPX2AZA0heWulvmAoKiQJ6TW6UDZBrGgrRWxeF6YuEeS1YPu3Kf9zKg56rXFhPsA1adRzra3CPfcpvOgxidcuh29ga4LJVZALsqkJLxaNAOaGIPMYp7gZB2nGP8C28N53TszdnfgZDZD";

  try {

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_source_url: req.headers.referer || "",
              user_data: {
                client_ip_address: req.headers["x-forwarded-for"] || "",
                client_user_agent: req.headers["user-agent"] || "",
              },
            },
          ],
        }),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
