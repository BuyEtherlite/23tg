import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { storage } = await import("../../server/storage");
    
    if (req.method === 'GET') {
      const settings = await storage.getPlatformSettings();
      res.status(200).json(settings);
    } else if (req.method === 'PATCH') {
      // For PATCH, we'd need to implement admin authentication
      // For now, just return method not allowed
      res.status(405).json({ error: 'PATCH method requires admin authentication - use main API' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Settings API error:', error);
    res.status(500).json({ error: "Failed to handle settings request" });
  }
}