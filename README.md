# Stellarium AI ICO Platform

A full-stack web application for the Stellarium AI Initial Coin Offering (ICO). The platform provides both user-facing and admin functionality for cryptocurrency token sales with P2P AI model training capabilities.

## Features

- **ICO Management**: Complete ICO stages, participant tracking, and transaction management
- **Web3 Integration**: MetaMask and other wallet connectivity
- **P2P AI Training**: Distributed AI model training across network participants
- **Admin Dashboard**: Comprehensive administration tools
- **Real-time Analytics**: Live metrics and resource monitoring
- **Payment Processing**: Multiple payment method support

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **Shadcn/ui** components with Tailwind CSS
- **TanStack React Query** for state management
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Neon Database** for production

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BuyEtherlite/23tg.git
cd 23tg
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Vercel Deployment

This platform is optimized for deployment on Vercel with Neon PostgreSQL integration.

### 1. Prepare Your Neon Database

1. Create a [Neon](https://neon.tech/) account
2. Create a new project and database
3. Copy your connection string

### 2. Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BuyEtherlite/23tg)

#### Option B: Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the project:
```bash
vercel
```

### 3. Configure Environment Variables

In your Vercel dashboard, add the following environment variables:

#### Required Variables
```
POSTGRES_URL=your_neon_database_connection_string
NODE_ENV=production
```

#### Optional Variables
```
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
REWON_API_KEY=your_rewon_api_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_PUBLIC_KEY=your_nowpayments_public_key
```

### 4. Run Database Migrations

After deployment, run the database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npm run db:push
```

### 5. Verify Deployment

Visit your deployed application's `/api/health` endpoint to verify the deployment:
```
https://your-app.vercel.app/api/health
```

You should see a response like:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "environment": "production",
  "version": "1.0.0"
}
```

## Environment Variables

### Development vs Production

The application supports both development and production environment variables:

- **Development**: Use `DATABASE_URL` for local PostgreSQL connections
- **Production/Vercel**: Use `POSTGRES_URL` for Neon database connections

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_URL` | Neon database connection string (production) | `postgresql://user:pass@host/db?sslmode=require` |
| `DATABASE_URL` | Local database connection string (development) | `postgresql://user:pass@localhost:5432/db` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `SESSION_SECRET` | Session encryption key | Generated |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:vercel` | Build frontend for Vercel |
| `npm run start` | Start production server |
| `npm run check` | Type check with TypeScript |
| `npm run db:push` | Push database schema |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Database Schema

The application uses Drizzle ORM with PostgreSQL. Key tables include:

- `ico_stages`: ICO stage configuration
- `participants`: User/wallet management
- `transactions`: Purchase transactions
- `platform_settings`: Application configuration
- `ai_model_pools`: P2P training pools
- `resource_contributions`: Compute resource tracking

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/stages` - ICO stages
- `GET /api/stages/current` - Current ICO stage
- `POST /api/participants` - Register participant
- `POST /api/transactions` - Create transaction

### Admin Endpoints
- `GET /api/admin/transactions` - All transactions
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/check` - Admin verification

### AI & P2P Endpoints
- `GET /api/pools` - AI model pools
- `POST /api/resources/contribute` - Contribute resources
- `GET /api/training/sessions` - Training sessions
- `GET /api/system/resources` - System metrics

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Verify your `POSTGRES_URL` is correct
- Ensure your Neon database is active
- Check that SSL mode is set to `require`

#### Build Failures
- Run `npm run check` to identify TypeScript errors
- Ensure all dependencies are installed
- Check that environment variables are set

#### Health Check Failing
- Verify database connectivity
- Check server logs in Vercel dashboard
- Ensure migrations have been run

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=express:*,drizzle:*
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## Architecture

### Serverless-First Design
- Stateless API routes
- Database connection pooling
- No persistent server state
- Environment-based configuration

### Security
- PostgreSQL with SSL
- Environment variable configuration
- CORS protection
- Input validation with Zod

### Performance
- Static asset optimization
- Database query optimization
- Efficient bundle splitting
- CDN-ready static files

## License

MIT License - see LICENSE file for details.

## Support

For deployment issues or questions:
- Check the [troubleshooting section](#troubleshooting)
- Review Vercel deployment logs
- Verify environment variables are correctly set
- Test the health endpoint: `/api/health`