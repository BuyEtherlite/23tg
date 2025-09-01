import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import storage to test database connection
    const { storage } = await import("../../server/storage");
    
    // Test database connection
    const stages = await storage.getIcoStages();
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV || "production",
      stages: stages.length
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}