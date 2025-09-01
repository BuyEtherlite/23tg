import { z } from 'zod';

// Environment variable schema for validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database configuration
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  
  // Session configuration
  SESSION_SECRET: z.string().min(32).default('fallback-session-secret-change-in-production'),
  
  // Optional API keys
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  REWON_API_KEY: z.string().optional(),
  NOWPAYMENTS_API_KEY: z.string().optional(),
  NOWPAYMENTS_PUBLIC_KEY: z.string().optional(),
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
  }
  
  console.log(`✅ Environment validated for ${config.NODE_ENV} mode`);
}

export { envSchema };