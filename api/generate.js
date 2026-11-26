import { generateImage, experimental_generateVideo as generateVideo } from 'ai';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, type, model } = req.body || {};
    if (!prompt || !type) return res.status(400).json({ error: 'Missing prompt or type' });

    if (type === 'image') {
      const { images } = await generateImage({ model: model || 'bfl/flux-2-flex', prompt });
      const base64 = Buffer.from(images[0].uint8Array).toString('base64');
      return res.status(200).json({ type: 'image', data: `data:image/png;base64,${base64}`, mimeType: 'image/png' });
    }
    if (type === 'video') {
      const { videos } = await generateVideo({ model: model || 'google/veo-3.1-fast-generate-001', prompt, duration: 8, aspectRatio: '16:9' });
      const base64 = Buffer.from(videos[0].uint8Array).toString('base64');
      return res.status(200).json({ type: 'video', data: `data:video/mp4;base64,${base64}`, mimeType: 'video/mp4' });
    }
    return res.status(400).json({ error: 'Invalid type' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
}
