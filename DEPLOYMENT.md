# AdPilot AI Deployment Guide

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)
- Supabase project with credentials
- Meta App ID and Secret (for OAuth)

## Environment Variables

Create `.env.local` for local development:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Meta OAuth
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=http://localhost:3000/api/meta/callback

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start dev server
npm run dev
```

## Production Build

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build
npm run build

# Start production server
npm start
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t adpilot-ai .
docker run -p 3000:3000 --env-file .env adpilot-ai
```

## Health Checks

The application exposes a health endpoint:

```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-21T12:00:00Z",
  "checks": {
    "database": { "status": "ok", "latency": 12 },
    "memory": { "status": "ok", "message": "Heap: 128MB" }
  }
}
```

## Security Checklist

- [ ] Environment variables are set and not committed
- [ ] Supabase RLS policies are enabled on all tables
- [ ] Rate limiting is configured (100 req/min default)
- [ ] CSP headers are active
- [ ] HSTS is enabled
- [ ] X-Frame-Options is set to DENY
- [ ] Audit logging is active
- [ ] HTTPS is enforced in production

## Monitoring

Key metrics to monitor:
- Response times (target < 200ms for API)
- Error rates (target < 1%)
- Database connection pool usage
- Memory usage (target < 512MB heap)
- Rate limit hit rate

## Backup Strategy

1. **Database**: Supabase handles automated backups
2. **Reports**: Store generated reports in Supabase Storage
3. **Audit logs**: Retain for 90 days minimum

## Scaling

For high traffic:
1. Enable Next.js ISR for static pages
2. Use Redis for rate limiting (replace in-memory map)
3. Enable Supabase connection pooling
4. Consider edge caching with CDN

## Troubleshooting

### Build fails
- Check Node.js version (>= 20)
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database connection errors
- Verify Supabase URL and keys
- Check RLS policies are not blocking requests
- Verify connection is not rate limited

### OAuth issues
- Verify Meta App ID and Secret
- Check redirect URI matches Meta app settings
- Ensure HTTPS in production
