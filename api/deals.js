export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'HUBSPOT_TOKEN environment variable is not set.' });
  }

  const after = req.query.offset || undefined;

  const body = {
    properties: [
      'dealname', 'amount', 'dealstage',
      'closedate', 'createdate',
      'hs_is_closed_won', 'hs_is_closed',
      'deal_currency_code'
    ],
    limit: 200,
  };
  if (after) body.after = after;

  try {
    const hubRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!hubRes.ok) {
      const text = await hubRes.text();
      return res.status(hubRes.status).json({ error: text });
    }

    const data = await hubRes.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
