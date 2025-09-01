# Vercel Deployment Configuration

This repository is configured for seamless deployment on Vercel with the following optimizations:

## ✅ Deployment Features

### Core Configuration
- **Complete vercel.json**: Proper API routing, static file serving, and SPA configuration
- **Serverless Functions**: Optimized API endpoints that reuse existing server logic
- **Build Optimization**: Chunk splitting and performance optimizations
- **Environment Support**: Proper database and environment variable handling

### API Structure
- **Main Handler**: `/api/serverless.ts` - Routes all API requests through existing server logic
- **Individual Endpoints**: Key endpoints available as separate files for better Vercel compatibility
  - `/api/health.ts` - Health check endpoint
  - `/api/stages.ts` - ICO stages endpoint
  - `/api/settings.ts` - Platform settings endpoint

### Frontend Optimizations
- **SPA Routing**: Properly configured for single-page application behavior
- **SEO Ready**: Meta tags and social sharing optimization
- **Performance**: Optimized builds with code splitting
- **Production Ready**: Development scripts and banners removed

## 🚀 Deployment Steps

1. **Connect Repository**: Connect this repository to your Vercel project
2. **Environment Variables**: Set up the following environment variables in Vercel:
   ```
   POSTGRES_URL=your_neon_database_url
   NODE_ENV=production
   SESSION_SECRET=your_session_secret
   ```
3. **Deploy**: Vercel will automatically use the configuration and build the project

## 📁 Build Output

- **Frontend**: Built to `dist/public/` directory
- **API**: Serverless functions in `/api/` directory
- **Static Files**: Properly served with SPA fallback to `index.html`

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build:vercel

# Type checking
npm run check
```

## 🌐 Production Features

- **Database**: Neon serverless PostgreSQL with connection pooling
- **CORS**: Properly configured for cross-origin requests
- **Security**: Security headers and proper error handling
- **Performance**: Optimized chunks and caching strategies
- **Health Checks**: Built-in health check endpoints for monitoring

## 📋 Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | Neon database connection string | ✅ |
| `NODE_ENV` | Environment (production) | ✅ |
| `SESSION_SECRET` | Session encryption key | ⚠️ |
| `REWON_API_KEY` | Payment integration | ❌ |
| `NOWPAYMENTS_API_KEY` | Payment integration | ❌ |

✅ = Required, ⚠️ = Recommended, ❌ = Optional