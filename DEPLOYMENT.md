# Deployment Guide

This guide covers deployment options for the Stellarium AI ICO Platform.

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- PostgreSQL database (we recommend Neon for serverless)

### Environment Variables
Set the following environment variables in your Vercel dashboard:

#### Required
```
NODE_ENV=production
POSTGRES_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret_min_32_chars
```

#### Optional (for payment integrations)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
REWON_API_KEY=your_rewon_api_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_PUBLIC_KEY=your_nowpayments_public_key
```

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
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
POSTGRES_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret_min_32_chars
```

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
- Always use strong `SESSION_SECRET` (minimum 32 characters)
- Never commit sensitive environment variables to git
- Use `.env.example` as a template

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