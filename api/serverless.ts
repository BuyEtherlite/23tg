import express from "express";

// Create Express app for serverless function
const app = express();

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic logging middleware for serverless functions
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// CORS headers for API routes
app.use((req, res, next) => {
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
    // Import the main routes registration function
    const { registerRoutes } = await import("../server/routes");
    
    // Create a fake server object since registerRoutes expects it but we don't need it in serverless
    const fakeServer = {
      listen: () => {},
      close: () => {},
      on: () => {},
      emit: () => {}
    } as any;
    
    // Register all routes from the main routes file
    await registerRoutes(app);
    
    routesRegistered = true;
    console.log('Serverless routes registered successfully');
  } catch (error) {
    console.error('Failed to register serverless routes:', error);
    
    // Fallback: register a basic health check if main routes fail
    app.get("/api/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
        error: "Routes registration failed, using fallback"
      });
    });
    
    // Add a basic error endpoint
    app.use('/api/*', (req, res) => {
      res.status(500).json({
        error: "API routes not properly initialized",
        path: req.path,
        method: req.method
      });
    });
    
    routesRegistered = true;
  }
}

// Main serverless function handler
export default async function handler(req: any, res: any) {
  try {
    await registerServerlessRoutes();
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}