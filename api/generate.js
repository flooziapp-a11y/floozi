export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, platform, tone } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const prompt = `You are Floozi, an AI built for Business & Money creators.
Generate content for:
Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
Return ONLY a JSON object, no markdown, no explanation:
{"hook":"A single powerful opening line (max 20 words) that stops the scroll.","script":"A complete short video script (150-220 words) in natural spoken language with hook, main point, example, and call to action.","caption":"A compelling caption (60-80 words) with 8-10 relevant business/money hashtags at the end."}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong generating your content.' });
  }
}
