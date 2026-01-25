# Swopify Web - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- A Vercel account
- A Supabase project set up
- The database schema from the Flutter app applied to your Supabase project
- Environment variables configured

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## Database Setup

### 1. Apply the Schema
Use the `database_schema.sql` file from the swop2 Flutter app to set up your Supabase database:

```sql
-- Run the complete schema from swop2/database_schema.sql
-- This includes all tables, functions, triggers, and RLS policies
```

### 2. Configure Storage Buckets
Ensure the following storage buckets are created in Supabase:
- `listing-images` (public)
- `profile-images` (public)
- `message-media` (private)

### 3. Set Up RLS Policies
The schema includes Row Level Security policies. Ensure they are properly applied for:
- Public listing access for guests
- User-specific data protection
- Proper authentication checks

## Local Development

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

### 3. Build and Test
```bash
npm run build
npm start
```

## Vercel Deployment

### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redeploy with environment variables
vercel --prod
```

### Method 2: GitHub Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Method 3: Vercel Dashboard
1. Import your project from Git
2. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Add environment variables
4. Deploy

## Build Configuration

The project includes optimized build configuration in `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
```

## Performance Optimization

### 1. Image Optimization
- Uses Next.js Image component for automatic optimization
- Configured for Supabase storage domains
- Lazy loading enabled by default

### 2. Code Splitting
- Automatic route-based code splitting
- Dynamic imports for heavy components
- Optimized bundle sizes

### 3. Caching Strategy
- Static assets cached at CDN level
- API responses cached appropriately
- Browser caching optimized

## Security Configuration

### 1. Content Security Policy
Add CSP headers in `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
          }
        ]
      }
    ]
  }
}
```

### 2. Environment Security
- Never commit `.env.local` to version control
- Use Vercel's environment variable management
- Separate development and production environments

## Monitoring and Analytics

### 1. Vercel Analytics
Enable in `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Monitoring
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Custom analytics for user behavior

## Domain Configuration

### 1. Custom Domain
1. Add your domain in Vercel dashboard
2. Configure DNS records:
   - A record: `76.76.19.61`
   - CNAME record: `cname.vercel-dns.com`
3. Enable HTTPS (automatic with Vercel)

### 2. Subdomain Setup
For staging environments:
- `staging.yourdomain.com` → staging branch
- `www.yourdomain.com` → main branch

## Database Migrations

### 1. Schema Updates
When updating the database schema:
```sql
-- Apply migrations in order
-- Test in development first
-- Use Supabase migration system
```

### 2. Data Migrations
For data transformations:
```sql
-- Create backup before migration
-- Run migrations during low traffic
-- Monitor for errors
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules
npm install

# Check TypeScript errors
npm run type-check
```

#### 2. Environment Variables
- Ensure all required variables are set
- Check variable names (case sensitive)
- Verify Supabase URL and keys

#### 3. Database Connection
- Verify Supabase project is active
- Check RLS policies are correctly configured
- Ensure database schema is up to date

#### 4. Image Loading Issues
- Verify Supabase storage is configured
- Check image domains in next.config.mjs
- Ensure storage buckets are public

### Performance Issues

#### 1. Slow Loading
- Check bundle size with `npm run analyze`
- Optimize images and assets
- Review database query performance

#### 2. High Memory Usage
- Monitor Vercel function memory
- Optimize large components
- Use dynamic imports for heavy libraries

## Maintenance

### 1. Regular Updates
- Update dependencies monthly
- Monitor security advisories
- Test updates in staging first

### 2. Database Maintenance
- Monitor query performance
- Clean up old data periodically
- Optimize indexes as needed

### 3. Monitoring
- Set up alerts for errors
- Monitor performance metrics
- Track user engagement

## Backup Strategy

### 1. Database Backups
- Supabase provides automatic backups
- Consider additional backup strategy for critical data
- Test restore procedures regularly

### 2. Code Backups
- Use Git for version control
- Tag releases for easy rollback
- Maintain staging environment

## Support and Documentation

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Getting Help
- Check the implementation summary for feature details
- Review component documentation
- Test in development environment first
- Use Vercel support for deployment issues

## Conclusion

This deployment guide covers all aspects of deploying the Swopify web application to production. Follow the steps carefully and test thoroughly in a staging environment before deploying to production.

Key deployment checklist:
- ✅ Environment variables configured
- ✅ Database schema applied
- ✅ Storage buckets created
- ✅ RLS policies enabled
- ✅ Build configuration optimized
- ✅ Domain configured
- ✅ Monitoring enabled
- ✅ Security headers configured
- ✅ Performance optimized
- ✅ Backup strategy in place