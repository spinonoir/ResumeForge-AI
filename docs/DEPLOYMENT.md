# ResumeForge AI Deployment Guide

This guide covers deploying ResumeForge AI to production environments using Firebase Hosting and related services.

## 🎯 Deployment Overview

ResumeForge AI uses a modern deployment strategy with:
- **Frontend**: Firebase Hosting with CDN
- **Database**: Firestore in production mode
- **Authentication**: Firebase Authentication
- **AI Services**: Google Cloud AI Platform (Gemini 2.0 Flash)
- **Functions**: Firebase Cloud Functions (planned)

## 🚀 Production Environment Setup

### Prerequisites

- Firebase CLI installed globally
- Google Cloud Project with billing enabled
- Google AI API access (Gemini 2.0 Flash)
- Domain name (optional, for custom domains)

### Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   # Create project in Firebase Console
   # Enable Authentication, Firestore, and Hosting
   ```

2. **Initialize Firebase**
   ```bash
   firebase login
   firebase init
   ```

3. **Select Services**
   - ✅ Firestore
   - ✅ Hosting
   - ✅ Storage
   - ⭕ Functions (future)

### Environment Configuration

#### Production Environment Variables

Create `.env.production`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI Configuration
GOOGLE_GENAI_API_KEY=your_production_ai_api_key

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

#### Firebase Configuration Files

**firebase.json**
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/_next/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

**firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User profile subcollections
      match /{collection}/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 🔧 Build and Deploy Process

### Automated Deployment

#### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

env:
  NODE_VERSION: '18'

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Type check
      run: npm run typecheck
      
    - name: Lint
      run: npm run lint
      
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
        NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
        GOOGLE_GENAI_API_KEY: ${{ secrets.GOOGLE_GENAI_API_KEY }}
        
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: ${{ secrets.GITHUB_TOKEN }}
        firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        channelId: live
        projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

### Manual Deployment

#### Build Process

1. **Install Dependencies**
   ```bash
   npm ci
   ```

2. **Type Check**
   ```bash
   npm run typecheck
   ```

3. **Lint Code**
   ```bash
   npm run lint
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

#### Deployment Commands

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy with custom message
firebase deploy -m "Deploy version 1.2.0"
```

## 🌐 Custom Domain Setup

### Domain Configuration

1. **Add Custom Domain**
   ```bash
   firebase hosting:channel:create production
   firebase hosting:channel:deploy production
   ```

2. **DNS Configuration**
   ```
   # A Records
   @ -> 151.101.1.195
   @ -> 151.101.65.195
   
   # AAAA Records (IPv6)
   @ -> 2a04:4e42::645
   @ -> 2a04:4e42:200::645
   ```

3. **SSL Certificate**
   Firebase automatically provisions SSL certificates for custom domains.

### Domain Verification

```bash
# Verify domain ownership
firebase hosting:domain:verify your-domain.com

# Check domain status
firebase hosting:domain:list
```

## 📊 Performance Optimization

### Build Optimization

#### Next.js Configuration

**next.config.ts**
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  // Bundle analysis
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  }
};

export default nextConfig;
```

#### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Monitor core web vitals
# Use Firebase Performance Monitoring
```

### CDN Configuration

Firebase Hosting automatically provides:
- Global CDN distribution
- Automatic compression (Gzip/Brotli)
- HTTP/2 support
- Fast SSL termination

## 🔒 Security Configuration

### Security Headers

**firebase.json** (enhanced)
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  }
}
```

### Environment Security

- Use Firebase project-specific API keys
- Enable App Check for additional security
- Configure CORS policies appropriately
- Regularly rotate API keys

## 📈 Monitoring and Analytics

### Firebase Analytics

1. **Enable Analytics**
   ```bash
   # In Firebase Console
   # Analytics > Enable Google Analytics
   ```

2. **Performance Monitoring**
   ```typescript
   // In your app
   import { getPerformance } from 'firebase/performance';
   
   if (typeof window !== 'undefined') {
     const perf = getPerformance(app);
   }
   ```

### Error Tracking

#### Sentry Integration (Optional)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Health Checks

Create monitoring endpoints:
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

## 🚨 Backup and Recovery

### Firestore Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket

# Schedule automated backups
# Use Cloud Scheduler with Cloud Functions
```

### Configuration Backup

- Store configuration in version control
- Backup environment variables securely
- Document all external service dependencies
- Maintain deployment runbooks

## 🔄 Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous version
firebase hosting:clone source-site-id:source-channel-id target-site-id:live

# Rollback specific deployment
firebase hosting:channel:deploy live --version previous-version-id
```

### Emergency Procedures

1. **Immediate Response**
   - Deploy maintenance page
   - Disable problematic features
   - Scale down if necessary

2. **Investigation**
   - Check error logs
   - Monitor performance metrics
   - Identify root cause

3. **Recovery**
   - Deploy fix or rollback
   - Verify functionality
   - Monitor for issues

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables updated
- [ ] Backup current deployment
- [ ] Notify team of deployment

### Deployment

- [ ] Build successful
- [ ] No build errors or warnings
- [ ] Deployment completed successfully
- [ ] SSL certificate valid
- [ ] CDN cache cleared

### Post-Deployment

- [ ] Application loads correctly
- [ ] Authentication working
- [ ] AI services responding
- [ ] Database connections active
- [ ] Monitor error rates
- [ ] Performance metrics normal

## 🎯 Environment Management

### Staging Environment

```bash
# Create staging channel
firebase hosting:channel:create staging

# Deploy to staging
firebase hosting:channel:deploy staging

# Preview staging URL
firebase hosting:channel:open staging
```

### Testing in Production

```bash
# A/B testing with multiple channels
firebase hosting:channel:create experiment-1
firebase hosting:channel:deploy experiment-1 --expires 7d
```

## 📞 Support and Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all environment variables are set
- Clear npm cache and reinstall dependencies

**Deployment Errors**
- Verify Firebase project permissions
- Check quota limits
- Ensure proper authentication

**Performance Issues**
- Enable compression
- Optimize images and assets
- Use proper caching headers

### Getting Help

- **Firebase Support**: Firebase Console support
- **Google Cloud Support**: For AI service issues
- **Community**: Stack Overflow, Discord
- **Documentation**: Firebase and Next.js docs

---

**Ready to deploy?** Follow this guide step by step and monitor your deployment closely! 