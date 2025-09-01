import express, { Request, Response, NextFunction } from "express";

// Create Express app
const app = express();

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic logging middleware for serverless functions
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// CORS headers for API routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

let routesRegistered = false;

async function registerServerlessRoutes() {
  if (routesRegistered) return;
  
  const { storage } = await import("../server/storage");
  const { SystemMonitor } = await import("../server/system-monitor");
  
  // Admin authentication middleware
  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const walletAddress = req.query.walletAddress as string;
      if (!walletAddress) {
        return res.status(401).json({ error: 'Wallet address required for admin access' });
      }

      const settings = await storage.getPlatformSettings();
      const adminWallets = settings?.adminWallets || [];
      
      if (!adminWallets.includes(walletAddress)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  };

  // Health check endpoint for Vercel deployment verification
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      // Test database connection
      const stages = await storage.getIcoStages();
      
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        environment: process.env.NODE_ENV || "development"
      });
    }
  });

  // Get ICO stages
  app.get("/api/stages", async (req: Request, res: Response) => {
    try {
      const stages = await storage.getIcoStages();
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ICO stages" });
    }
  });

  // Get current ICO stage
  app.get("/api/stages/current", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getPlatformSettings();
      if (!settings?.currentStageId) {
        return res.status(404).json({ error: "No current stage set" });
      }

      const currentStage = await storage.getIcoStageById(settings.currentStageId);
      if (!currentStage) {
        return res.status(404).json({ error: "Current stage not found" });
      }

      res.json(currentStage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current stage" });
    }
  });

  // Get participant by wallet address
  app.get("/api/participants/:walletAddress", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.params;
      const participant = await storage.getParticipantByWallet(walletAddress);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participant" });
    }
  });

  // Create participant
  app.post("/api/participants", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      const existingParticipant = await storage.getParticipantByWallet(walletAddress);
      if (existingParticipant) {
        return res.json(existingParticipant);
      }

      const participant = await storage.createParticipant({ walletAddress });
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to create participant" });
    }
  });

  // Get transactions for participant
  app.get("/api/transactions/:participantId", async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;
      const transactions = await storage.getTransactionsByParticipant(participantId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Settings
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // System Resources
  app.get("/api/system/resources", async (req: Request, res: Response) => {
    try {
      const resources = await SystemMonitor.getAllSystemResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system resources" });
    }
  });

  // Admin check
  app.get('/api/admin/check', async (req: Request, res: Response) => {
    try {
      const walletAddress = req.query.walletAddress as string;
      if (!walletAddress) {
        return res.json({ isAdmin: false, adminWallets: [] });
      }

      const settings = await storage.getPlatformSettings();
      const adminWallets = settings?.adminWallets || [];
      const isAdmin = adminWallets.includes(walletAddress);

      res.json({ 
        isAdmin, 
        adminWallets: isAdmin ? adminWallets : [] 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check admin status' });
    }
  });

  routesRegistered = true;
}

export default async function handler(req: Request, res: Response) {
  try {
    await registerServerlessRoutes();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}