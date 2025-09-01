import { z } from 'zod';

// Environment variable schema for validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database configuration
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  
  // Session configuration
  SESSION_SECRET: z.string().min(32).default('fallback-session-secret-change-in-production'),
  
  // Stack Auth configuration
  STACK_PROJECT_ID: z.string().optional(),
  STACK_PUBLISHABLE_CLIENT_KEY: z.string().optional(),
  STACK_SECRET_SERVER_KEY: z.string().optional(),
  
  // Payment integrations (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  REWON_API_KEY: z.string().optional(),
  NOWPAYMENTS_API_KEY: z.string().optional(),
  NOWPAYMENTS_PUBLIC_KEY: z.string().optional(),
  
  // Development configuration
  DEBUG: z.string().optional().default('false'),
  CORS_ORIGINS: z.string().optional(),
  
  // Production configuration
  PRODUCTION_MODE: z.string().optional().default('false'),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  
  // Monitoring and logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  HEALTH_CHECK_URL: z.string().url().optional(),
}).refine(data => {
  // Ensure at least one database URL is provided
  return data.DATABASE_URL || data.POSTGRES_URL;
}, {
  message: "Either DATABASE_URL or POSTGRES_URL must be provided",
  path: ["DATABASE_URL"]
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

export function getConfig(): EnvConfig {
  if (!config) {
    try {
      config = envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('❌ Invalid environment configuration:');
        error.errors.forEach(err => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
      }
      throw error;
    }
  }
  return config;
}

export function validateEnvironment(): void {
  const config = getConfig();
  
  // Warn about production concerns
  if (config.NODE_ENV === 'production') {
    if (config.SESSION_SECRET === 'fallback-session-secret-change-in-production') {
      console.warn('⚠️  WARNING: Using default SESSION_SECRET in production. Please set a secure SESSION_SECRET environment variable.');
    }
    
    if (!config.DATABASE_URL && !config.POSTGRES_URL) {
      console.error('❌ DATABASE_URL or POSTGRES_URL is required in production');
      process.exit(1);
    }
    
    // Check for Stack Auth configuration in production
    if (!config.STACK_PROJECT_ID || !config.STACK_SECRET_SERVER_KEY) {
      console.warn('⚠️  WARNING: Stack Auth not configured. Set STACK_PROJECT_ID and STACK_SECRET_SERVER_KEY for authentication.');
    }
    
    // Validate session secret strength
    if (config.SESSION_SECRET.length < 64) {
      console.warn('⚠️  WARNING: SESSION_SECRET should be at least 64 characters for production security.');
    }
    
    // Check for production mode flag
    if (config.PRODUCTION_MODE !== 'true') {
      console.warn('⚠️  WARNING: PRODUCTION_MODE not enabled. Set PRODUCTION_MODE=true for enhanced security.');
    }
  }
  
  // Development warnings
  if (config.NODE_ENV === 'development') {
    if (config.SESSION_SECRET === 'fallback-session-secret-change-in-production') {
      console.info('ℹ️  Using default SESSION_SECRET for development. Generate a secure one for production.');
    }
  }
  
  console.log(`✅ Environment validated for ${config.NODE_ENV} mode`);
}

export { envSchema };

// Utility function to generate secure session secret
export function generateSecureSessionSecret(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}

// Utility function to validate database connection string
export function validateDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'postgresql:' && Boolean(parsed.hostname) && Boolean(parsed.pathname);
  } catch {
    return false;
  }
}

// Get Stack Auth configuration
export function getStackAuthConfig(): { 
  projectId?: string; 
  publishableKey?: string; 
  secretKey?: string; 
} {
  const config = getConfig();
  return {
    projectId: config.STACK_PROJECT_ID,
    publishableKey: config.STACK_PUBLISHABLE_CLIENT_KEY,
    secretKey: config.STACK_SECRET_SERVER_KEY,
  };
}