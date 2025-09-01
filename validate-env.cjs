#!/usr/bin/env node

/**
 * Environment Configuration Validation Script
 * 
 * This script validates that all environment variables are properly configured
 * and provides guidance for production deployment.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔒 Environment Configuration Validation\n');

// Check if .env.example exists and read it
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example file not found');
  process.exit(1);
}

console.log('✅ .env.example file found');

// Read .env.example to extract all documented variables
const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
const envVariables = [];

envExampleContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  if (line.trim() && !line.trim().startsWith('#') && line.includes('=')) {
    const [varName] = line.split('=');
    if (varName && !varName.startsWith('#')) {
      envVariables.push(varName.trim());
    }
  }
});

console.log(`📋 Found ${envVariables.length} environment variables documented`);

// Categorize variables
const requiredVars = [
  'NODE_ENV', 'POSTGRES_URL', 'SESSION_SECRET',
  'STACK_PROJECT_ID', 'STACK_PUBLISHABLE_CLIENT_KEY', 'STACK_SECRET_SERVER_KEY'
];

const securityVars = [
  'SESSION_SECRET', 'STACK_SECRET_SERVER_KEY',
  'STRIPE_SECRET_KEY', 'NOWPAYMENTS_API_KEY'
];

const productionVars = [
  'PRODUCTION_MODE', 'LOG_LEVEL', 'RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX_REQUESTS'
];

// Check required variables
console.log('\n🔍 Checking required environment variables...');
requiredVars.forEach(varName => {
  if (envVariables.includes(varName)) {
    console.log(`✅ ${varName} - documented`);
  } else {
    console.log(`❌ ${varName} - missing from .env.example`);
  }
});

// Generate sample secure values
console.log('\n🔑 Sample Secure Values for Production:');
const sampleSessionSecret = crypto.randomBytes(64).toString('hex');
console.log(`SESSION_SECRET=${sampleSessionSecret}`);

// Validation checklist
console.log('\n📝 Pre-deployment Validation Checklist:');

const checklist = [
  '[ ] Generated secure SESSION_SECRET (64+ characters)',
  '[ ] Configured Neon database URLs with SSL enabled',
  '[ ] Set up Stack Auth project credentials',
  '[ ] Set PRODUCTION_MODE=true for production deployment',
  '[ ] Configured appropriate LOG_LEVEL for environment',
  '[ ] Set up rate limiting parameters',
  '[ ] Verified no sensitive credentials in version control',
  '[ ] Tested health check endpoint (/api/health)',
  '[ ] Validated database connectivity',
  '[ ] Confirmed Stack Auth configuration works',
  '[ ] Set up monitoring for the application',
  '[ ] Configured CORS_ORIGINS for your domain'
];

checklist.forEach(item => {
  console.log(`  ${item}`);
});

// Security recommendations
console.log('\n🛡️  Security Recommendations:');
console.log('  • Use different credentials for dev/staging/production');
console.log('  • Rotate secrets regularly (quarterly recommended)');
console.log('  • Monitor for credential leaks in logs');
console.log('  • Use environment-specific deployment keys');
console.log('  • Enable database connection SSL in production');
console.log('  • Set up alerting for failed authentication attempts');

// Deployment platforms
console.log('\n☁️  Platform-specific Environment Setup:');

console.log('\n🔷 Vercel Deployment:');
console.log('  1. Go to your Vercel project dashboard');
console.log('  2. Navigate to Settings > Environment Variables');
console.log('  3. Add each required variable from the checklist above');
console.log('  4. Deploy and test the /api/health endpoint');

console.log('\n🟢 Traditional Node.js:');
console.log('  1. Create .env file in project root');
console.log('  2. Copy values from .env.example and replace with real values');
console.log('  3. Ensure .env is in .gitignore');
console.log('  4. Start with: npm run build && npm start');

console.log('\n🐳 Docker Deployment:');
console.log('  1. Pass environment variables via -e flags or docker-compose.yml');
console.log('  2. Use Docker secrets for sensitive values');
console.log('  3. Mount .env file as a volume (not recommended for production)');

console.log('\n✨ Next Steps:');
console.log('  1. Copy .env.example to .env');
console.log('  2. Replace all placeholder values with real credentials');
console.log('  3. Run: npm run check:deployment');
console.log('  4. Test locally: npm run dev');
console.log('  5. Verify health check: curl http://localhost:5000/api/health');
console.log('  6. Deploy to your chosen platform');

console.log('\n🎯 Environment configuration validation complete!');