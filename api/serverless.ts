import express from "express";
import { Request, Response, NextFunction } from "express";

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
  
  try {
    // Import the original route registration function and adapt it for serverless
    const { registerRoutes } = await import("../server/routes");
    
    // Register all routes using the existing function
    // We ignore the returned server since we don't need it in serverless
    await registerRoutes(app);
    
    routesRegistered = true;
  } catch (error) {
    console.error("Failed to register routes:", error);
    
    // Fallback: register minimal essential routes if the full registration fails
    const { storage } = await import("../server/storage");
    
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

    // Essential ICO routes
    app.get("/api/stages", async (req: Request, res: Response) => {
      try {
        const stages = await storage.getIcoStages();
        res.json(stages);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch ICO stages" });
      }
    });

    app.get("/api/settings", async (req: Request, res: Response) => {
      try {
        const settings = await storage.getPlatformSettings();
        res.json(settings);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
      }
    });
    
    routesRegistered = true;
  }
}

export default async function handler(req: any, res: any) {
  await registerServerlessRoutes();
  return app(req, res);
}