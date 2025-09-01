# Deployment Guide

This guide covers deployment options for the Stellarium AI ICO Platform.

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- PostgreSQL database (we recommend Neon for serverless)

### Environment Variables
Set the following environment variables in your Vercel dashboard:

#### Required Core Variables
```bash
NODE_ENV=production
POSTGRES_URL=postgresql://neondb_owner:npg_qwjCLe54MTdo@ep-ancient-hill-a2bnzhr1-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=your_secure_session_secret_minimum_64_characters
```

#### Stack Auth Configuration (Required for Authentication)
```bash
STACK_PROJECT_ID=42e0b860-0408-4849-ab73-95131a5e40bc
STACK_PUBLISHABLE_CLIENT_KEY=pck_nrtv0jvcmtx2zba49hq54fg5wv0mc0memrrd2edc9re1r
STACK_SECRET_SERVER_KEY=ssk_fjk86ns9p2yk0d2cmpzzsmhkx22jgx7by6fdamkk07x58
```

#### Additional Database URLs (Optional)
```bash
# Alternative database URL for compatibility
DATABASE_URL=postgresql://neondb_owner:npg_qwjCLe54MTdo@ep-ancient-hill-a2bnzhr1.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Direct URL for Prisma migrations (unpooled)
DIRECT_URL=postgresql://neondb_owner:npg_qwjCLe54MTdo@ep-ancient-hill-a2bnzhr1.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

#### Payment Integrations (Optional)
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
REWON_API_KEY=your_rewon_api_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_PUBLIC_KEY=your_nowpayments_public_key
```

#### Production Security Settings (Recommended)
```bash
PRODUCTION_MODE=true
DEBUG=false
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generating Secure Session Secret
Generate a cryptographically secure session secret:

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 64

# Method 3: Using online generator (ensure it's from a trusted source)
# Visit: https://generate.plus/en/number/random-hex
```

⚠️ **Security Warning**: Never use the example credentials in production. Generate your own secure values.

### Deployment Steps
1. Fork/clone this repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy using the provided `vercel.json` configuration
5. Your application will be available at your Vercel domain

### Build Configuration
The project is configured with:
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist/public`
- **Node.js Runtime**: 20.x
- **API Routes**: Handled by `/api/serverless.ts`

## Traditional Node.js Deployment

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database
- Process manager (PM2 recommended)

### Environment Variables
Create a `.env` file or set environment variables:

```bash
# Core Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration (Neon PostgreSQL)
POSTGRES_URL=postgresql://neondb_owner:npg_qwjCLe54MTdo@ep-ancient-hill-a2bnzhr1-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Security Configuration
SESSION_SECRET=your_secure_session_secret_minimum_64_characters

# Stack Auth Configuration
STACK_PROJECT_ID=42e0b860-0408-4849-ab73-95131a5e40bc
STACK_PUBLISHABLE_CLIENT_KEY=pck_nrtv0jvcmtx2zba49hq54fg5wv0mc0memrrd2edc9re1r
STACK_SECRET_SERVER_KEY=ssk_fjk86ns9p2yk0d2cmpzzsmhkx22jgx7by6fdamkk07x58

# Production Settings
PRODUCTION_MODE=true
DEBUG=false
LOG_LEVEL=info
```

⚠️ **Important**: Replace example credentials with your own secure values before deployment.

### Deployment Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Start the server: `npm start`

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/index.js --name "stellarium-ai"

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

## Health Check Endpoints

The application provides health check endpoints for monitoring:

- **Main Health Check**: `GET /api/health`
  - Returns application status, database connectivity, and environment info
  - Returns 200 for healthy, 503 for unhealthy

Example response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "environment": "production",
  "version": "1.0.0"
}
```

## Performance Optimizations

### Static File Caching
- Static assets are cached for 1 year in production
- HTML files are not cached to ensure fresh content
- ETag and Last-Modified headers are enabled

### Database Connection
- Uses connection pooling for PostgreSQL
- Serverless-optimized for Vercel deployment
- Automatic connection management

### Error Handling
- Comprehensive error logging
- Graceful error responses
- No server crashes from unhandled errors

## Security Considerations

### Environment Variables
- Always use strong `SESSION_SECRET` (minimum 64 characters for production)
- Never commit sensitive environment variables to git
- Use `.env.example` as a template for setting up your environment
- Validate all required environment variables before deployment
- Use different credentials for development, staging, and production environments

#### Environment Variable Security Checklist
- [ ] Generated secure `SESSION_SECRET` (64+ characters)
- [ ] Configured Neon database URLs with SSL
- [ ] Set up Stack Auth credentials
- [ ] Enabled `PRODUCTION_MODE=true` for production
- [ ] Set appropriate `LOG_LEVEL` for environment
- [ ] Configured rate limiting settings
- [ ] Verified no sensitive data in version control

#### Database URL Format
```bash
# Neon PostgreSQL format
postgresql://username:password@host.region.provider.neon.tech/database?sslmode=require

# Connection pooling (recommended for production)
POSTGRES_URL=postgresql://neondb_owner:password@ep-xxx-pooler.region.aws.neon.tech/database?sslmode=require

# Direct connection (for migrations)
DIRECT_URL=postgresql://neondb_owner:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
```

### Database Security
- Use SSL connections for production databases
- Implement proper access controls
- Regular security updates

### CORS Configuration
- CORS is configured for API routes in serverless mode
- Adjust CORS settings based on your domain requirements

## Monitoring and Logging

### Logs
- All errors are logged with timestamps and context
- Request logging for API endpoints
- Performance metrics for database queries

### Monitoring
- Health check endpoint for uptime monitoring
- Database connection status monitoring
- Resource usage tracking

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 20.x+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify `POSTGRES_URL` is correct
   - Check database server availability
   - Ensure SSL mode is properly configured

3. **Static Files Not Loading**
   - Check if build directory exists (`dist/public`)
   - Verify build was successful
   - Check file permissions

4. **API Routes Not Working**
   - Verify serverless function deployment
   - Check API route configuration in `vercel.json`
   - Review function logs in Vercel dashboard

### Getting Help
- Check application logs for detailed error messages
- Use health check endpoint to verify system status
- Review environment variable configuration
- Check database connectivity

## Development vs Production

### Development
- Hot reloading with Vite
- Detailed error messages
- Source maps enabled
- CORS disabled

### Production
- Optimized static builds
- Minimal error exposure
- Caching enabled
- Security headers configured

---

For additional support, please refer to the project documentation or create an issue in the repository.