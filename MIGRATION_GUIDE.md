# Blog Migration Guide: Subdomain → Subpath

**Project:** RebelFi Blog Migration
**From:** `blog.rebelfi.io` (subdomain)
**To:** `rebelfi.io/blog` (subpath)
**Date:** 2025-12-07
**Status:** Planning Phase - Ready for Implementation

---

## Executive Summary

This document provides a complete guide for migrating the RebelFi blog from a subdomain (`blog.rebelfi.io`) to a subpath (`rebelfi.io/blog`). The migration consolidates two separate VPS deployments into one, improving operational efficiency while maintaining SEO rankings through proper 301 redirects.

**Key Outcomes:**
- Reduced infrastructure complexity (single VPS)
- Preserved SEO rankings via 301 redirects
- Improved user experience (single domain)
- Lower operational overhead
- Estimated downtime: 5-10 minutes for blog only

---

## Table of Contents

1. [Overview & Strategy](#overview--strategy)
2. [Blog Codebase Changes](#blog-codebase-changes)
3. [Main Site Changes](#main-site-changes)
4. [VPS Deployment](#vps-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [DNS Management](#dns-management)
7. [SEO & Search Engine Updates](#seo--search-engine-updates)
8. [Testing Strategy](#testing-strategy)
9. [Migration Timeline](#migration-timeline)
10. [Monitoring & Validation](#monitoring--validation)
11. [Troubleshooting](#troubleshooting)

---

## Overview & Strategy

### Current Architecture

**Blog (Current State)**
- **Domain:** blog.rebelfi.io
- **Location:** Separate VPS or serverless platform
- **Framework:** Next.js 14.2.10 (App Router)
- **Port:** 8811
- **CMS:** Contentful (GraphQL)
- **CDN:** DigitalOcean Spaces
- **Analytics:** Google Analytics (ID: G-GMSR3PP910)

**Main Site (Current State)**
- **Domain:** rebelfi.io
- **Location:** Primary VPS with nginx
- **Framework:** Next.js 15.4.6 (App Router)
- **Port:** 8000
- **Analytics:** Mixpanel

### Target Architecture

**Both Apps - Same VPS**
```
VPS Server (rebelfi.io)
├── nginx (reverse proxy)
│   ├── / → 127.0.0.1:8000 (main site)
│   ├── /blog → 127.0.0.1:8811 (blog)
│   └── 301 redirect: blog.rebelfi.io → rebelfi.io/blog
├── PM2 (process manager)
│   ├── rebelfi-main (port 8000)
│   └── rebelfi-blog (port 8811)
└── SSL certificates (unified)
```

### Why This Approach?

| Aspect | Benefit |
|--------|---------|
| **Cost** | Single VPS instead of two |
| **Operations** | Unified deployment, monitoring, backups |
| **SEO** | Single domain improves authority |
| **User Experience** | Consistent domain |
| **Maintenance** | Simplified infrastructure |
| **Performance** | Reduced DNS lookups |

---

## Blog Codebase Changes

### 1. Update Environment Variables

**File:** `/Users/si/projects/maxi/blog/.env`

**Current:**
```env
NEXT_PUBLIC_BASE_URL=http://rebelfi.io
```

**Update to:**
```env
NEXT_PUBLIC_BASE_URL=https://rebelfi.io/blog
```

**Why:** This environment variable controls:
- Canonical URLs in OpenGraph metadata
- Sitemap URL generation
- JSON-LD structured data
- Redirect URLs

### 2. Create Production Environment File

**Create:** `/Users/si/projects/maxi/blog/.env.production`

```env
# Environment
ENVIRONMENT_NAME=production

# Base URL - CRITICAL for all URL generation
NEXT_PUBLIC_BASE_URL=https://rebelfi.io/blog

# Contentful CMS
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=2qewwl5ekuw3
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=9r2HpRKupu8z73-XwlavN5hw1kLA_yfqd4G_gODtpXE
NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN=3_iBtjFVsX04ikkWGhc6Yp9W2tpaFGqcGSa8XBRiJDc
NEXT_PUBLIC_CONTENTFUL_SPACE_ENVIRONMENT=master

# Analytics
NEXT_PUBLIC_GA_ID=G-GMSR3PP910

# AI FAQ Generation
CLAUDE_API_KEY=sk-ant-api03-REDACTED
```

**Security Note:** Add `.env.production` to `.gitignore` to prevent accidental commits of secrets.

### 3. Configure Next.js for /blog Base Path

**File:** `/Users/si/projects/maxi/blog/next.config.js`

**Current (line ~16):**
```javascript
module.exports = withPlugins(plugins, {
  env: {
    ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME,
  },
  // ... rest of config
});
```

**Update to:**
```javascript
module.exports = withPlugins(plugins, {
  basePath: '/blog',  // ADD THIS LINE - All routes prefixed with /blog

  env: {
    ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME,
  },

  // ... rest of config unchanged
});
```

**What `basePath` does:**
- Automatically prepends `/blog` to all routes
- Routes: `/blog`, `/blog/article-slug`, `/blog/_next/*`
- Handles static asset paths
- Manages image optimization paths
- No manual route changes needed

### 4. Fix Hardcoded URL Fallbacks

**File:** `/Users/si/projects/maxi/blog/src/components/features/article/ArticleSchema.tsx`

This file contains hardcoded fallback URLs that will cause issues if environment variables aren't set.

**Lines 17, 55, 67 - Current:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blog.rebelfi.com';
```

**Update all three instances to:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rebelfi.io/blog';
```

**Why this matters:**
- Fallback is used if environment variable not set
- Old fallback points to wrong domain
- Affects JSON-LD structured data
- Impacts search engine indexing

### 5. Update robots.txt

**File:** `/Users/si/projects/maxi/blog/public/robots.txt`

**Current:**
```txt
User-agent: *
Allow: /
```

**Update to:**
```txt
User-agent: *
Allow: /

Sitemap: https://rebelfi.io/blog/sitemap.xml
```

**Note:** With `basePath: '/blog'`, sitemap path is `/blog/sitemap.xml`

### 6. Verify Sitemap Generation

**File:** `/Users/si/projects/maxi/blog/src/app/sitemap.ts` (no changes needed)

✅ This file already uses `process.env.NEXT_PUBLIC_BASE_URL` correctly
✅ Once environment variable is updated, sitemap URLs will be correct
✅ Example: `https://rebelfi.io/blog/article-slug`

### 7. Create Deployment Script

**Create:** `/Users/si/projects/maxi/blog/bin/deploy.sh`

```bash
#!/bin/bash
set -e

# ============================================================================
# Blog Deployment Script
# Usage: ./bin/deploy.sh
# This script builds the blog and deploys it to the VPS
# ============================================================================

# Configuration - UPDATE THESE BEFORE FIRST USE
VPS_IP="YOUR_VPS_IP_HERE"           # e.g., 192.168.1.100
VPS_USER="YOUR_VPS_USERNAME_HERE"   # e.g., ubuntu
DEPLOY_DIR="/var/www/rebelfi/blog"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate configuration
if [ "$VPS_IP" = "YOUR_VPS_IP_HERE" ] || [ "$VPS_USER" = "YOUR_VPS_USERNAME_HERE" ]; then
    echo -e "${RED}❌ ERROR: Update VPS_IP and VPS_USER in deploy.sh${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Starting Blog Deployment${NC}"

# Step 1: Build
echo -e "${YELLOW}🔨 Building blog...${NC}"
yarn build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Step 2: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar -czf blog-deploy.tar.gz \
  .next/ \
  public/ \
  node_modules/ \
  package.json \
  yarn.lock \
  next.config.js \
  tsconfig.json \
  .env.production
echo -e "${GREEN}✅ Package created${NC}"

# Step 3: Transfer to VPS
echo -e "${YELLOW}🚀 Transferring to VPS...${NC}"
scp blog-deploy.tar.gz $VPS_USER@$VPS_IP:/tmp/
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Transfer failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Transfer successful${NC}"

# Step 4: Deploy on VPS
echo -e "${YELLOW}⚙️  Deploying on VPS...${NC}"
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
  set -e

  echo "Creating deployment directory..."
  sudo mkdir -p /tmp/blog-deploy-temp

  echo "Extracting deployment package..."
  sudo tar -xzf /tmp/blog-deploy.tar.gz -C /tmp/blog-deploy-temp

  echo "Backing up current deployment..."
  sudo mv /var/www/rebelfi/blog /var/www/rebelfi/blog.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

  echo "Moving new deployment..."
  sudo mv /tmp/blog-deploy-temp /var/www/rebelfi/blog

  echo "Setting permissions..."
  sudo chown -R www-data:www-data /var/www/rebelfi/blog

  echo "Restarting blog application..."
  pm2 restart rebelfi-blog || echo "Warning: PM2 process might not be started yet"

  echo "Cleaning up temporary files..."
  rm /tmp/blog-deploy.tar.gz

  echo "✅ VPS deployment successful"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ VPS deployment failed${NC}"
    exit 1
fi

# Step 5: Cleanup
echo -e "${YELLOW}🧹 Cleaning up local files...${NC}"
rm blog-deploy.tar.gz
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify blog is running: curl https://rebelfi.io/blog"
echo "2. Monitor logs: ssh $VPS_USER@$VPS_IP 'pm2 logs rebelfi-blog'"
echo "3. Check nginx: ssh $VPS_USER@$VPS_IP 'sudo systemctl status nginx'"
```

**Make executable:**
```bash
chmod +x /Users/si/projects/maxi/blog/bin/deploy.sh
```

**Before first use:**
1. Update `VPS_IP` with your actual VPS IP
2. Update `VPS_USER` with your SSH username (usually `ubuntu`, `root`, or `ec2-user`)

**Usage:**
```bash
./bin/deploy.sh
```

### 8. Testing Blog Changes Locally

```bash
# Install dependencies (if not already done)
yarn install

# Build with new configuration
yarn build

# Start production server on port 8811
yarn start

# Test in browser - should work
# http://localhost:8811/blog (main page)
# http://localhost:8811/blog/article-slug (article pages)

# Check that assets load from /blog path
# Open DevTools → Network tab
# Should see: /blog/_next/static/..., /blog/public/...

# Test sitemap
# http://localhost:8811/blog/sitemap.xml

# Test robots.txt
# http://localhost:8811/blog/robots.txt
```

---

## Main Site Changes

### 1. Add Sitemap for Main Site

**Create:** `/Users/si/projects/maxi/midas/apps/frontend/src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rebelfi.io';

  return [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    // Authentication pages
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Marketing pages
    {
      url: `${baseUrl}/request-demo`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    // Note: Blog sitemap handled separately by blog app at /blog/sitemap.xml
  ];
}
```

**Why separate sitemaps?**
- Each app maintains its own
- Easier to update independently
- Standard practice for multi-app sites
- Both referenced in main robots.txt

### 2. Add robots.txt for Main Site

**Create:** `/Users/si/projects/maxi/midas/apps/frontend/public/robots.txt`

```txt
User-agent: *
Allow: /

# Main site sitemap
Sitemap: https://rebelfi.io/sitemap.xml

# Blog sitemap (served by blog app via nginx reverse proxy)
Sitemap: https://rebelfi.io/blog/sitemap.xml
```

### 3. Update Root Layout with SEO Metadata

**File:** `/Users/si/projects/maxi/midas/apps/frontend/src/app/layout.tsx`

**Current (lines 19-21):**
```typescript
export const metadata: Metadata = {
  title: 'RebelFi'
};
```

**Replace with:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://rebelfi.io'),
  title: {
    default: 'RebelFi - Bitcoin Treasury Management',
    template: '%s | RebelFi'
  },
  description: 'Professional Bitcoin treasury management for modern businesses',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rebelfi.io',
    siteName: 'RebelFi',
    title: 'RebelFi - Bitcoin Treasury Management',
    description: 'Professional Bitcoin treasury management for modern businesses',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RebelFi - Bitcoin Treasury Management',
    description: 'Professional Bitcoin treasury management for modern businesses',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**What this improves:**
- `metadataBase` - enables canonical URL generation
- Proper title templates for all pages
- Rich OpenGraph metadata for social sharing
- Twitter card metadata
- Explicit robot indexing rules

### 4. Add Environment Variable

**File:** `/Users/si/projects/maxi/midas/apps/frontend/.env`

**Add:**
```env
NEXT_PUBLIC_BASE_URL=https://rebelfi.io
```

**Note:** If not needed immediately, can be added later for consistency.

---

## VPS Deployment

### 1. Directory Structure

Create the following on your VPS:

```bash
/var/www/rebelfi/
├── main-site/           # Main app (existing)
│   ├── .next/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── blog/                # Blog app (new)
    ├── .next/
    ├── node_modules/
    ├── public/
    ├── src/
    ├── package.json
    ├── .env.production
    └── ...
```

### 2. PM2 Process Manager Configuration

**Create on VPS:** `/var/www/rebelfi/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      // Main site application
      name: 'rebelfi-main',
      cwd: '/var/www/rebelfi/main-site',
      script: 'node_modules/.bin/next',
      args: 'start -p 8000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      // Logging
      error_file: '/var/log/pm2/rebelfi-main-error.log',
      out_file: '/var/log/pm2/rebelfi-main-out.log',
      time: true,
      // Auto restart on crash
      watch: false,
      max_memory_restart: '500M',
      // Graceful shutdown
      kill_timeout: 5000,
    },
    {
      // Blog application
      name: 'rebelfi-blog',
      cwd: '/var/www/rebelfi/blog',
      script: 'node_modules/.bin/next',
      args: 'start -p 8811',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8811
      },
      // Logging
      error_file: '/var/log/pm2/rebelfi-blog-error.log',
      out_file: '/var/log/pm2/rebelfi-blog-out.log',
      time: true,
      // Auto restart on crash
      watch: false,
      max_memory_restart: '500M',
      // Graceful shutdown
      kill_timeout: 5000,
    }
  ]
};
```

### 3. Initial PM2 Setup (SSH to VPS)

```bash
# Install PM2 globally (if not already installed)
sudo npm install -g pm2

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R www-data:www-data /var/log/pm2

# Start both applications
cd /var/www/rebelfi
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Make PM2 start on system boot
pm2 startup

# Verify both apps are running
pm2 list
pm2 status
```

**Expected output:**
```
┌────┬──────────────┬──────┬──────┬────────┬─────────┬────────┐
│ id │ name         │ mode │ ↺    │ status │ ↻       │ uptime │
├────┼──────────────┼──────┼──────┼────────┼─────────┼────────┤
│ 0  │ rebelfi-main │ fork │ 0    │ online │ 0       │ 1m     │
│ 1  │ rebelfi-blog │ fork │ 0    │ online │ 0       │ 1m     │
└────┴──────────────┴──────┴──────┴────────┴─────────┴────────┘
```

### 4. Deploy Blog Using Script

From your local machine:

```bash
cd /Users/si/projects/maxi/blog

# Edit deploy.sh with your VPS details
nano bin/deploy.sh
# Update VPS_IP and VPS_USER

# Run deployment
./bin/deploy.sh
```

---

## Nginx Configuration

### 1. Current Nginx Setup

Existing configuration handles main site (rebelfi.io → 127.0.0.1:8000)

We need to:
1. Add reverse proxy for `/blog` → 127.0.0.1:8811
2. Add 301 redirect server block for old subdomain
3. Update HTTP redirect to include blog subdomain
4. Update SSL certificate to include blog.rebelfi.io

### 2. Updated Nginx Configuration

**File:** `/etc/nginx/sites-available/rebelfi.io`

**Add upstream for blog (after any existing upstreams):**
```nginx
upstream rebelfi_blog {
    server 127.0.0.1:8811;
    keepalive 64;
}
```

**Add to main server block (`server_name rebelfi.io`):**
```nginx
    # Blog application location
    location /blog {
        proxy_pass http://rebelfi_blog;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Blog static files (enable caching)
    location /blog/_next/static {
        proxy_pass http://rebelfi_blog;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
```

**Update HTTP redirect server (around line 5):**
```nginx
# FROM:
server {
    listen 80;
    server_name rebelfi.io www.rebelfi.io;
    return 301 https://rebelfi.io$request_uri;
}

# TO:
server {
    listen 80;
    listen [::]:80;
    server_name rebelfi.io www.rebelfi.io blog.rebelfi.io;  # Add blog.rebelfi.io
    return 301 https://rebelfi.io$request_uri;
}
```

**Add new server block for blog subdomain redirect (before main server block):**
```nginx
# Redirect old blog subdomain to new subpath
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name blog.rebelfi.io;

    # SSL configuration (reuse main certificate)
    ssl_certificate /etc/letsencrypt/live/rebelfi.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rebelfi.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging for monitoring redirect traffic
    access_log /var/log/nginx/blog.rebelfi.io.redirect.log;

    # 301 permanent redirect - preserves all parameters
    return 301 https://rebelfi.io/blog$request_uri;
}
```

### 3. Test Nginx Configuration

```bash
# Backup existing configuration
sudo cp /etc/nginx/sites-available/rebelfi.io /etc/nginx/sites-available/rebelfi.io.backup

# Edit configuration
sudo nano /etc/nginx/sites-available/rebelfi.io

# Test syntax (critical!)
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4. Reload Nginx

```bash
# Reload (doesn't drop existing connections)
sudo systemctl reload nginx

# Verify status
sudo systemctl status nginx

# Check if listening on correct ports
sudo netstat -tulpn | grep nginx
# Should show: 80, 443
```

### 5. Update SSL Certificate

Add blog subdomain to certificate:

```bash
# This will add blog.rebelfi.io to existing certificate
sudo certbot --nginx -d rebelfi.io -d www.rebelfi.io -d blog.rebelfi.io

# Or if expanding existing certificate:
sudo certbot certonly --nginx -d rebelfi.io -d www.rebelfi.io -d blog.rebelfi.io
```

**Verify certificate:**
```bash
sudo certbot certificates
```

---

## DNS Management

### 1. Update A Record

**Action Required:** Update DNS A record for `blog.rebelfi.io`

**Log into DNS provider** (Cloudflare, Route53, Namecheap, etc.)

**Find and update:**
```
Name: blog.rebelfi.io
Type: A
Current Value: OLD_VPS_IP
New Value: MAIN_VPS_IP (same as rebelfi.io)
TTL: Keep as is (will propagate faster)
```

### 2. Verify DNS Changes

**On local machine:**
```bash
# Check DNS resolution
dig blog.rebelfi.io +short
dig rebelfi.io +short

# Both should return the same IP

# Monitor propagation
watch dig blog.rebelfi.io +short  # Updates every 2 seconds

# Check globally: https://www.whatsmydns.net/
```

### 3. DNS Propagation Timeline

**Typical timeline:** 24-48 hours
- **Immediate:** Changes applied at authoritative DNS servers
- **1-4 hours:** Most global DNS resolvers updated
- **12-48 hours:** All resolver caches refreshed
- **Monitor with:** `dig`, `nslookup`, or whatsmydns.net

### 4. Post-Migration DNS Strategy

**Short term (6-12 months):**
- Keep `blog.rebelfi.io` DNS record
- Serves 301 redirects
- Handles remaining old links
- Preserves SEO link equity

**Long term (12+ months):**
- Remove `blog.rebelfi.io` A record
- Redirects no longer serve original purpose
- Frees up DNS record

---

## SEO & Search Engine Updates

### 1. How 301 Redirects Preserve SEO

The nginx configuration handles this automatically:
```
blog.rebelfi.io/article-slug → rebelfi.io/blog/article-slug (301)
```

**What happens:**
- Search engines see 301 (permanent) redirect
- Canonical page becomes refelfi.io/blog/article-slug
- ~90-99% of link equity transferred
- Rankings preserved over time (2-4 weeks)

### 2. Google Search Console Setup

**Step 1: Add Property**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add property"
3. Type: `https://rebelfi.io` (URL prefix)
4. Click "Continue"

**Step 2: Verify Ownership**
Choose one method:
- **HTML tag:** Copy-paste tag into `<head>`
- **DNS record:** Add TXT record to DNS
- **Google Analytics:** If already connected
- **Google Tag Manager:** If already connected

**Step 3: Submit Sitemaps**
1. Once verified, go to Sitemaps section
2. Submit two sitemaps:
   - `https://rebelfi.io/sitemap.xml` (main site)
   - `https://rebelfi.io/blog/sitemap.xml` (blog)
3. Wait for indexing (2-7 days)

**Step 4: Configure Change of Address**
1. Go to old property (`blog.rebelfi.io`)
2. Settings gear → Change of Address
3. Select "https://rebelfi.io"
4. Follow wizard to confirm
5. Google will:
   - Update index mapping
   - Consolidate ranking signals
   - Prioritize new URL
   - Monitor for issues

**Step 5: Monitor During Migration**
- **Coverage report:** Track indexing status
  - Look for decrease in blog post indexes during first week
  - Should stabilize with new URLs indexed within 2-4 weeks
- **URL Inspection:** Check individual article canonical URLs
- **Core Web Vitals:** Monitor performance metrics
- **Index Status:** Track old vs. new URL indexing

### 3. Bing Webmaster Tools Setup

**Step 1: Add Site**
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters/)
2. Add site: `https://rebelfi.io`
3. Verify ownership (same methods as Google)

**Step 2: Submit Sitemaps**
1. Go to Sitemaps section
2. Submit both:
   - `https://rebelfi.io/sitemap.xml`
   - `https://rebelfi.io/blog/sitemap.xml`

**Step 3: Site Move Tool**
1. Go to Tools → Site Move (if available)
2. Configure redirect:
   - Old site: `blog.rebelfi.io`
   - New site: `rebelfi.io/blog`
3. Bing will monitor for proper 301 redirects

### 4. Structured Data Validation

**Before & After Migration:**

1. **Visit:** [Rich Results Test](https://search.google.com/test/rich-results)
2. **Test URL:** `https://rebelfi.io/blog/[article-slug]` (after migration)
3. **What to verify:**
   - Article schema recognized ✅
   - Canonical URL correct ✅
   - All required fields present ✅
   - Images load properly ✅
   - FAQ schema present (if applicable) ✅

**Common issues to fix:**
- Canonical URLs pointing to wrong domain (blog.rebelfi.com)
- Image URLs not absolute
- Missing required schema fields
- Malformed JSON-LD

### 5. Analytics Configuration

**Google Analytics:**
- GA tracking code in blog will continue to work
- Path will change from `/article-slug` → `/blog/article-slug`
- Create GA filter to consolidate traffic:
  - **Include:** Page path begins with `/blog/`
  - Create views for blog-only traffic monitoring
- Set up goals for blog conversions:
  - Newsletter signups
  - CTA clicks
  - Time on page

**Mixpanel (Main Site):**
- No changes needed
- Already tracking main site separately

---

## Testing Strategy

### Pre-Deployment Testing (Local Environment)

#### Blog Tests

```bash
cd /Users/si/projects/maxi/blog

# 1. Environment setup
echo "Testing environment variables..."
grep NEXT_PUBLIC_BASE_URL .env
# Should show: NEXT_PUBLIC_BASE_URL=https://rebelfi.io/blog

# 2. Build test
echo "Building blog..."
yarn clean  # Remove old build
yarn build
# Should complete without errors

# 3. Start test
echo "Starting blog..."
yarn start
# Should start successfully on port 3000 (default)
```

#### Browser Testing

Navigate to:
- `http://localhost:3000/blog` - Homepage should load
- `http://localhost:3000/blog/[test-article-slug]` - Article should load
- `http://localhost:3000/blog/_next/static/` - Assets should load
- `http://localhost:3000/blog/sitemap.xml` - Sitemap readable
- `http://localhost:3000/blog/robots.txt` - robots.txt readable

#### DevTools Verification

Press F12 → Network tab:
- Check that _next assets load from `/blog/_next/static/`
- No 404 errors
- Images load from correct CDN (digitaloceanspaces.com)

#### Structured Data Test

1. View page source (Ctrl+U)
2. Search for `"@type": "Article"`
3. Verify canonical URL: `https://rebelfi.io/blog/article-slug`
4. Verify images have absolute URLs
5. Verify publisher info is correct

### VPS Pre-Deployment Testing

```bash
# SSH into VPS
ssh ubuntu@YOUR_VPS_IP

# 1. Test blog process is running
pm2 list
# rebelfi-blog should show "online"

# 2. Test local curl (bypass nginx)
curl http://localhost:8811/blog
# Should return HTML

# 3. Test through nginx
curl https://rebelfi.io/blog
# Should return blog homepage

# 4. Test article page
curl https://rebelfi.io/blog/[article-slug]
# Should return article page

# 5. Test redirect from old domain
curl -I https://blog.rebelfi.io
# Should show: HTTP/1.1 301 Moved Permanently
# Location: https://rebelfi.io/blog/
```

### Post-Deployment Full Testing

#### Redirect Testing

```bash
# Test 301 redirect status
curl -I https://blog.rebelfi.io
# ✅ Should return: HTTP 301

curl -I https://blog.rebelfi.io/article-slug
# ✅ Should return: HTTP 301 with Location: https://refelfi.io/blog/article-slug

# Follow redirects with curl
curl -L https://blog.rebelfi.io/article-slug
# ✅ Should eventually resolve to article content
```

#### Functionality Testing

| Feature | Test | Expected |
|---------|------|----------|
| Homepage | Visit https://rebelfi.io/blog | Loads completely |
| Articles | Click article links | Navigate to /blog/slug |
| Images | Load article with images | All images render |
| Sitemap | Visit /blog/sitemap.xml | Valid XML sitemap |
| robots.txt | View /blog/robots.txt | Shows correct sitemap URL |
| Preview | Test Contentful draft mode | Preview works |
| Newsletter | Newsletter signup form | Form submits |
| Internal nav | Click "Read more" buttons | Navigate correctly |

#### Browser Testing

Test in multiple browsers/devices:
- ✅ Chrome (desktop)
- ✅ Chrome (mobile)
- ✅ Safari (desktop)
- ✅ Safari (mobile)
- ✅ Firefox
- ✅ Edge

#### SEO Verification

```bash
# Check canonical URLs
curl https://rebelfi.io/blog/article-slug | grep canonical
# Should show: https://refelfi.io/blog/article-slug

# Check OpenGraph
curl https://rebelfi.io/blog/article-slug | grep "property=\"og:"
# Should show article title, description, image

# Validate Rich Results
# Visit: https://search.google.com/test/rich-results
# Test: https://refelfi.io/blog/article-slug
# Should show "Article" in valid items
```

#### Performance Testing

```bash
# Check response time
time curl https://rebelfi.io/blog
# Should be < 500ms

# Check page size
curl -s https://refelfi.io/blog | wc -c
# Should be reasonable (< 1MB HTML)

# Use tools:
# - Google PageSpeed Insights
# - GTmetrix
# - WebPageTest
```

---

## Migration Timeline

### Phase 1: Preparation (1-2 Days)

**No user impact - can be done at any time**

- [ ] Update blog `.env` with new BASE_URL
- [ ] Add `basePath: '/blog'` to next.config.js
- [ ] Fix hardcoded URLs in ArticleSchema.tsx
- [ ] Update robots.txt
- [ ] Create deployment script
- [ ] Test blog locally
- [ ] Commit changes to git repo
- [ ] Add sitemap and robots.txt to main site
- [ ] Update main site metadata
- [ ] Test main site locally
- [ ] Commit main site changes
- [ ] Prepare VPS ecosystem config
- [ ] Verify VPS directory structure

**Estimated time: 2-4 hours**

### Phase 2: Deployment (30-60 minutes)

**Blog-only downtime: 5-10 minutes | Best: low-traffic time**

- [ ] SSH into VPS and verify both ports (8000, 8811) free
- [ ] Ensure PM2 is installed: `pm2 -v`
- [ ] Run deployment script locally: `./bin/deploy.sh`
- [ ] Verify blog running: `curl http://localhost:8811/blog`
- [ ] Update nginx config with blog reverse proxy
- [ ] Test nginx config: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx`
- [ ] Update SSL certificate: `sudo certbot --nginx ...`
- [ ] Deploy main site updates (sitemap, metadata)
- [ ] Restart main app: `pm2 restart rebelfi-main`
- [ ] Smoke test both apps

**Estimated time: 30 minutes**

### Phase 3: DNS Update (Immediate, 24-48h propagation)

**When to do: After testing Phase 2**

- [ ] Update DNS A record: `blog.rebelfi.io` → `MAIN_VPS_IP`
- [ ] Monitor propagation with `dig blog.rebelfi.io +short`
- [ ] Wait for global propagation (24-48 hours)
- [ ] Verify redirect working: `curl -I https://blog.rebelfi.io`

**Estimated time: 5 minutes for action, 24-48h for propagation**

### Phase 4: SEO Updates (2-4 hours, spread over days)

**After DNS propagates and everything stable**

- [ ] Create Google Search Console property
- [ ] Verify property
- [ ] Submit sitemaps to GSC
- [ ] Configure Change of Address
- [ ] Create Bing Webmaster property
- [ ] Submit sitemaps to Bing
- [ ] Validate structured data with Rich Results Test
- [ ] Submit specific URLs for re-indexing in GSC

**Estimated time: 2-4 hours total**

### Phase 5: Monitoring & Validation (1-2 weeks)

**Active monitoring period**

- [ ] Daily: Monitor Google Search Console (coverage, errors)
- [ ] Daily: Monitor error logs
- [ ] Daily: Check analytics for traffic shifts
- [ ] Weekly: Review Core Web Vitals
- [ ] Weekly: Test sample article pages
- [ ] Week 2+: Monitor for any ranking issues
- [ ] Week 4: Verify stabilization

**Estimated time: 30 minutes per day monitoring**

---

## Monitoring & Validation

### Real-Time Monitoring

#### Check Blog Process Status
```bash
# SSH into VPS
ssh ubuntu@YOUR_VPS_IP

# View all processes
pm2 list

# Monitor real-time
pm2 monit

# View blog logs
pm2 logs rebelfi-blog
```

#### Monitor Nginx Traffic
```bash
# Watch access logs
tail -f /var/log/nginx/rebelfi.io.access.log

# Watch redirect traffic
tail -f /var/log/nginx/blog.rebelfi.io.redirect.log

# Search for errors
grep ERROR /var/log/nginx/rebelfi.io.error.log
```

#### Check Resources
```bash
# CPU and memory
top

# Disk space
df -h

# Nginx connections
sudo netstat -tulpn | grep nginx
```

### Daily Monitoring (Week 1)

**Tasks:**
- Check error logs for issues
- Verify blog process running
- Monitor traffic patterns
- Test sample blog URLs
- Review Analytics

**Commands:**
```bash
# Check for PM2 crashes
pm2 status
pm2 logs rebelfi-blog --err

# Check response times
curl -w "@curl-timing.txt" -o /dev/null -s https://rebelfi.io/blog

# Check for errors in nginx
sudo tail -20 /var/log/nginx/rebelfi.io.error.log
```

### Weekly Monitoring (Weeks 2-4)

**Tasks:**
- Review Google Search Console coverage
- Monitor ranking changes
- Check Core Web Vitals
- Analyze analytics trends
- Test random article URLs

**Google Search Console Checks:**
1. Coverage report
   - Indexed → should increase
   - Excluded → monitor
   - Error → fix if any
2. Core Web Vitals
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1
3. Performance
   - Click-through rate
   - Average position
   - Impressions

### Monthly Monitoring

After stabilization (30+ days):
- Review overall traffic patterns
- Check for SEO ranking changes
- Monitor for broken links
- Review error logs
- Update analytics goals

---

## Troubleshooting

### Blog Not Loading at /blog

**Symptoms:** `https://rebelfi.io/blog` returns 404

**Diagnosis:**
```bash
# Check if blog process running
pm2 status
# Should show rebelfi-blog as "online"

# Check nginx config
sudo nginx -t
# Should show "syntax is ok"

# Check nginx is forwarding requests
curl -v https://rebelfi.io/blog
# Check response headers

# Check blog listening on port 8811
sudo netstat -tulpn | grep 8811
# Should show 127.0.0.1:8811
```

**Solutions:**
1. Restart blog: `pm2 restart rebelfi-blog`
2. Check logs: `pm2 logs rebelfi-blog`
3. Reload nginx: `sudo systemctl reload nginx`
4. Check disk space: `df -h`

### Redirect Not Working

**Symptoms:** `blog.rebelfi.io` doesn't redirect to `refelfi.io/blog`

**Diagnosis:**
```bash
# Check DNS pointing to correct IP
dig blog.rebelfi.io +short
# Should return MAIN_VPS_IP

# Check curl follows redirect
curl -L https://blog.refelfi.io
# Should eventually show blog content

# Check redirect status
curl -I https://blog.refelfi.io
# Should show: HTTP/1.1 301 Moved Permanently
```

**Solutions:**
1. Check DNS propagated: `dig blog.refelfi.io +short`
2. Wait for DNS propagation (up to 48 hours)
3. Verify nginx server block for blog.refelfi.io present
4. Check SSL certificate includes blog.refelfi.io: `sudo certbot certificates`

### Canonical URLs Wrong

**Symptoms:** Page source shows wrong canonical URL

**Fix:**
1. Verify `.env.production` has correct BASE_URL
2. Verify `ArticleSchema.tsx` lines 17, 55, 67 updated
3. Rebuild and redeploy blog
4. Wait for ISP cache to clear (up to 48 hours)

### Images Not Loading

**Symptoms:** Blog images showing broken image

**Diagnosis:**
```bash
# Check image URLs in page source
curl https://refelfi.io/blog/article | grep "img src"

# Check if CDN responsive
curl -I https://rebelfi.nyc3.cdn.digitaloceanspaces.com/...

# Check Contentful images loading
curl -I https://images.ctfassets.net/...
```

**Solutions:**
1. Check image remotePatterns in next.config.js
2. Verify Contentful API token working
3. Check DigitalOcean Spaces bucket permissions
4. Verify image URLs are absolute

### Analytics Not Tracking

**Symptoms:** No page views showing in Google Analytics

**Diagnosis:**
```bash
# Check GA tracking code in page source
curl https://refelfi.io/blog | grep "gtag"

# Verify GA ID in .env.production
grep GA_ID .env.production

# Check browser console for JS errors
# F12 → Console tab → look for errors
```

**Solutions:**
1. Verify `NEXT_PUBLIC_GA_ID` set correctly
2. Ensure GA property includes `/blog` paths
3. Check GA settings haven't excluded /blog path
4. Wait for real-time tracking (5-10 minutes)

---

## Success Criteria

After migration, verify all of the following:

### Functionality ✅
- [ ] Blog loads at https://refelfi.io/blog
- [ ] All article pages load correctly
- [ ] Images display properly
- [ ] Internal links work
- [ ] Contentful preview mode works
- [ ] Newsletter signup works
- [ ] No console JavaScript errors

### SEO ✅
- [ ] Sitemap accessible at /blog/sitemap.xml
- [ ] robots.txt present with correct sitemap URL
- [ ] Canonical URLs correct in page source
- [ ] OpenGraph metadata present
- [ ] Article schema validates in Rich Results Test
- [ ] FAQ schema validates (if applicable)

### Redirects ✅
- [ ] blog.refelfi.io returns 301 status
- [ ] Redirects to refelfi.io/blog correctly
- [ ] Redirects preserve full path/slug
- [ ] Redirects preserve query parameters

### Performance ✅
- [ ] Response time < 500ms
- [ ] Lighthouse score > 80
- [ ] Core Web Vitals all "Good"
- [ ] No 404 errors in logs
- [ ] No 5xx errors in logs

### Search Engines ✅
- [ ] Google Search Console shows both sitemaps
- [ ] Google Search Console shows coverage
- [ ] Bing shows indexed pages
- [ ] No crawl errors
- [ ] Canonical URLs recognized

### Analytics ✅
- [ ] Google Analytics tracking fires
- [ ] Page paths show /blog/article-slug
- [ ] No traffic drop for old blog URLs
- [ ] Redirect traffic visible in reports

---

## Conclusion

This migration consolidates your blog and main site onto a single VPS while preserving SEO rankings through proper 301 redirects. The phased approach minimizes downtime and allows for thorough testing at each stage.

**Key Success Factors:**
1. Proper 301 redirects from old subdomain
2. SEO foundation improvements on main site
3. Correct environment variable configuration
4. Thorough testing before and after
5. Active monitoring during first 2 weeks
6. Patience with DNS propagation and search engine crawling

**Timeline:**
- Preparation: 1-2 days
- Deployment: 30-60 minutes
- DNS propagation: 24-48 hours
- SEO stabilization: 2-4 weeks
- Full validation: 30 days

Questions or issues? Check the Troubleshooting section above.

