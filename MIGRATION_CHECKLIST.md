# Blog Migration Checklist

**From:** blog.rebelfi.io → **To:** rebelfi.io/blog

---

## Pre-Migration Preparation (Offline)

### Step 1: Blog Code Changes

- [ ] **Update blog `.env`**
  - Location: `/Users/si/projects/maxi/blog/.env`
  - Change: `NEXT_PUBLIC_BASE_URL=https://rebelfi.io/blog`

- [ ] **Create `.env.production`**
  - Location: `/Users/si/projects/maxi/blog/.env.production`
  - Add production environment variables (see MIGRATION_GUIDE.md)

- [ ] **Add basePath to Next.js config**
  - Location: `/Users/si/projects/maxi/blog/next.config.js`
  - Add: `basePath: '/blog',` around line 16

- [ ] **Fix hardcoded URLs in ArticleSchema**
  - Location: `/Users/si/projects/maxi/blog/src/components/features/article/ArticleSchema.tsx`
  - Lines 17, 55, 67: Change `'https://blog.rebelfi.com'` → `'https://rebelfi.io/blog'`

- [ ] **Update robots.txt**
  - Location: `/Users/si/projects/maxi/blog/public/robots.txt`
  - Add: `Sitemap: https://rebelfi.io/blog/sitemap.xml`

- [ ] **Create deployment script**
  - Location: `/Users/si/projects/maxi/blog/bin/deploy.sh`
  - Copy template from MIGRATION_GUIDE.md
  - Update `VPS_IP` and `VPS_USER`
  - Run: `chmod +x bin/deploy.sh`

- [ ] **Test blog locally**
  ```bash
  cd /Users/si/projects/maxi/blog
  yarn install
  yarn build
  yarn start
  # Visit: http://localhost:3000/blog
  # Verify assets load from /blog/_next/
  ```

- [ ] **Commit blog changes**
  ```bash
  git add .
  git commit -m "Configure blog for /blog subpath migration"
  git push origin main
  ```

### Step 2: Main Site Code Changes

- [ ] **Create sitemap for main site**
  - Location: `/Users/si/projects/maxi/midas/apps/frontend/src/app/sitemap.ts`
  - Copy template from MIGRATION_GUIDE.md

- [ ] **Create robots.txt for main site**
  - Location: `/Users/si/projects/maxi/midas/apps/frontend/public/robots.txt`
  - Reference both sitemaps (main + blog)

- [ ] **Update root layout metadata**
  - Location: `/Users/si/projects/maxi/midas/apps/frontend/src/app/layout.tsx`
  - Replace minimal metadata with comprehensive SEO metadata

- [ ] **Add environment variable** (optional)
  - Location: `/Users/si/projects/maxi/midas/apps/frontend/.env`
  - Add: `NEXT_PUBLIC_BASE_URL=https://rebelfi.io`

- [ ] **Test main site locally**
  ```bash
  cd /Users/si/projects/maxi/midas/apps/frontend
  yarn build
  yarn start
  # Visit: http://localhost:8000/
  # Check: /sitemap.xml and /robots.txt
  ```

- [ ] **Commit main site changes**
  ```bash
  git add .
  git commit -m "Add SEO foundation: sitemap, robots.txt, metadata"
  git push origin main
  ```

### Step 3: Prepare VPS

- [ ] **Verify VPS has required space**
  ```bash
  ssh ubuntu@YOUR_VPS_IP
  df -h
  # Need ~2GB for blog deployment
  ```

- [ ] **Create directory structure**
  ```bash
  sudo mkdir -p /var/www/rebelfi/blog
  sudo mkdir -p /var/log/pm2
  sudo chown -R www-data:www-data /var/log/pm2
  ```

- [ ] **Verify PM2 installed**
  ```bash
  pm2 -v
  # If not installed: sudo npm install -g pm2
  ```

- [ ] **Create PM2 ecosystem config**
  - Location: `/var/www/rebelfi/ecosystem.config.js`
  - Copy template from MIGRATION_GUIDE.md

- [ ] **Backup nginx config**
  ```bash
  sudo cp /etc/nginx/sites-available/rebelfi.io /etc/nginx/sites-available/rebelfi.io.backup
  ```

---

## Migration Day (Minimize Downtime)

### Phase 1: Deploy Blog (5-10 minutes)

- [ ] **Verify nothing broken locally**
  ```bash
  cd /Users/si/projects/maxi/blog
  yarn build  # Should succeed
  ```

- [ ] **Run deployment script**
  ```bash
  ./bin/deploy.sh
  # Script will:
  # - Build blog
  # - Create tarball
  # - Transfer to VPS
  # - Extract and start blog
  # - Return success message
  ```

- [ ] **Verify blog running**
  ```bash
  ssh ubuntu@YOUR_VPS_IP
  pm2 list
  # rebelfi-blog should show "online"
  pm2 logs rebelfi-blog
  ```

- [ ] **Test local curl**
  ```bash
  curl http://localhost:8811/blog
  # Should return HTML
  ```

### Phase 2: Update Nginx (3-5 minutes)

- [ ] **Edit nginx config**
  ```bash
  sudo nano /etc/nginx/sites-available/rebelfi.io
  ```
  - Add upstream for blog (port 8811)
  - Add `/blog` location block
  - Add `/blog/_next/static` caching
  - Update HTTP redirect to include blog.rebelfi.io
  - Add new server block for blog.rebelfi.io 301 redirect

- [ ] **Test nginx config**
  ```bash
  sudo nginx -t
  # Must show: "syntax is ok" and "test successful"
  ```

- [ ] **Reload nginx**
  ```bash
  sudo systemctl reload nginx
  sudo systemctl status nginx
  # Should show "active (running)"
  ```

### Phase 3: Update SSL Certificate (3-5 minutes)

- [ ] **Add blog subdomain to certificate**
  ```bash
  sudo certbot --nginx -d rebelfi.io -d www.rebelfi.io -d blog.rebelfi.io
  # May prompt to choose existing cert
  ```

- [ ] **Verify certificate updated**
  ```bash
  sudo certbot certificates
  # Should show blog.rebelfi.io in domains list
  ```

### Phase 4: Deploy Main Site Updates (2-3 minutes)

- [ ] **Build main site**
  ```bash
  cd /Users/si/projects/maxi/midas/apps/frontend
  yarn build
  ```

- [ ] **Restart main app**
  ```bash
  ssh ubuntu@YOUR_VPS_IP
  pm2 restart rebelfi-main
  ```

### Phase 5: Smoke Tests (5 minutes)

- [ ] **Test blog homepage**
  ```bash
  curl https://rebelfi.io/blog
  # Should return HTML
  ```

- [ ] **Test main site**
  ```bash
  curl https://rebelfi.io
  # Should return HTML
  ```

- [ ] **Test sitemap**
  ```bash
  curl https://rebelfi.io/sitemap.xml
  curl https://rebelfi.io/blog/sitemap.xml
  # Both should return valid XML
  ```

- [ ] **Test robots.txt**
  ```bash
  curl https://rebelfi.io/robots.txt
  curl https://rebelfi.io/blog/robots.txt
  # Both should be readable
  ```

**✅ Deployment complete! (Total: 20-30 minutes)**

---

## DNS Update (Do After Phase 1-5 Verified)

### Update DNS A Record

- [ ] **Log into DNS provider**
  - Cloudflare / Route53 / Namecheap / etc.

- [ ] **Find A record for blog.rebelfi.io**
  - Type: A
  - Current value: OLD_VPS_IP
  - New value: MAIN_VPS_IP (same as rebelfi.io)

- [ ] **Update and save**

- [ ] **Monitor propagation**
  ```bash
  # Run every 5 minutes until changed
  dig blog.rebelfi.io +short
  # Should eventually return MAIN_VPS_IP

  # Check online: https://www.whatsmydns.net/
  # Enter: blog.rebelfi.io
  # Wait for all locations to update (24-48h typical)
  ```

---

## Post-Migration SEO Updates

### Google Search Console

- [ ] **Add new property**
  - URL: https://rebelfi.io
  - Verify ownership (HTML tag, DNS, GA, GTM)

- [ ] **Submit sitemaps**
  - https://rebelfi.io/sitemap.xml
  - https://rebelfi.io/blog/sitemap.xml

- [ ] **Configure Change of Address**
  - In old property (blog.rebelfi.io)
  - Settings → Change of Address
  - Select new property (rebelfi.io)

- [ ] **Monitor Coverage**
  - Check Coverage report daily for first week
  - Track indexed/excluded/error changes

### Bing Webmaster Tools

- [ ] **Add site**
  - URL: https://rebelfi.io
  - Verify ownership

- [ ] **Submit sitemaps**
  - https://rebelfi.io/sitemap.xml
  - https://rebelfi.io/blog/sitemap.xml

- [ ] **Configure Site Move**
  - Old: blog.rebelfi.io
  - New: rebelfi.io/blog

### Structured Data

- [ ] **Validate with Rich Results Test**
  - URL: https://search.google.com/test/rich-results
  - Test: https://rebelfi.io/blog/[article-slug]
  - Should show "Article" as valid item

---

## Verification Tests

### Redirect Tests

- [ ] `curl -I https://blog.rebelfi.io`
  - ✅ Should show HTTP 301

- [ ] `curl -L https://blog.rebelfi.io/article-slug`
  - ✅ Should show article content (not redirect response)

- [ ] Test in browser
  - ✅ https://blog.rebelfi.io should redirect to https://rebelfi.io/blog

### Functionality Tests

- [ ] Homepage: https://rebelfi.io/blog
  - ✅ Loads, images display, navigation works

- [ ] Article pages: https://rebelfi.io/blog/[slug]
  - ✅ Load article, images display, content visible

- [ ] Internal navigation
  - ✅ Clicking article links navigates to /blog/slug

- [ ] Contentful preview mode
  - ✅ Draft preview still works

### SEO Tests

- [ ] View page source
  - ✅ Canonical URL: https://rebelfi.io/blog/slug
  - ✅ OG URL: https://rebelfi.io/blog/slug
  - ✅ Article schema present

- [ ] Rich Results Test
  - ✅ Article schema validates
  - ✅ FAQ schema validates (if applicable)

- [ ] Sitemap
  - ✅ https://rebelfi.io/blog/sitemap.xml valid
  - ✅ URLs are: https://rebelfi.io/blog/[slugs]

### Analytics Tests

- [ ] Google Analytics
  - ✅ Real-time tracking fires (check Real-Time report)
  - ✅ Page path shows /blog/slug

### Performance Tests

- [ ] Response time
  ```bash
  time curl https://rebelfi.io/blog
  # ✅ Should be < 500ms
  ```

- [ ] No errors
  ```bash
  curl https://rebelfi.io/blog 2>&1 | grep -i error
  # ✅ Should show nothing
  ```

---

## Monitoring (Week 1)

### Daily

- [ ] Check error logs
  ```bash
  ssh ubuntu@YOUR_VPS_IP
  tail -20 /var/log/nginx/rebelfi.io.error.log
  # ✅ Should be empty or show expected errors only
  ```

- [ ] Check blog process
  ```bash
  pm2 status
  # ✅ rebelfi-blog should show "online"
  ```

- [ ] Test sample URLs
  - ✅ Visit 3-5 random article pages
  - ✅ Verify they load and look correct

- [ ] Monitor analytics
  - ✅ Check Google Analytics for traffic
  - ✅ Verify page paths show /blog/slug

### Issues to Watch For

- ❌ 404 errors → Check nginx config
- ❌ Broken images → Check CDN access
- ❌ No analytics → Check GA code
- ❌ Slow response → Check VPS resources
- ❌ Redirect loops → Check nginx config

---

## Cleanup (After 1-2 Weeks)

- [ ] Monitor stabilization
  - ✅ No major errors
  - ✅ Traffic patterns normal
  - ✅ Search engines indexing

- [ ] Review logs for issues
  - ✅ Check for 5xx errors
  - ✅ Check for redirect issues

- [ ] Document any lessons learned

- [ ] Update team documentation
  - ✅ Blog is now at rebelfi.io/blog
  - ✅ Old subdomain redirects automatically

---

## Rollback Steps (If Needed)

**If critical issues within 1 hour:**

```bash
# 1. Revert nginx config
sudo cp /etc/nginx/sites-available/rebelfi.io.backup /etc/nginx/sites-available/rebelfi.io
sudo nginx -t
sudo systemctl reload nginx

# 2. Stop blog
pm2 stop rebelfi-blog

# 3. Point DNS back to old VPS (in DNS provider)
# blog.rebelfi.io A record → OLD_VPS_IP
```

---

## Success Criteria

After migration, verify:

- ✅ Blog loads at https://rebelfi.io/blog
- ✅ Old domain (blog.rebelfi.io) redirects with 301
- ✅ All article pages load
- ✅ Images display
- ✅ Sitemaps valid
- ✅ No console errors
- ✅ Analytics tracking
- ✅ Response time < 500ms
- ✅ No significant traffic drop

---

## Support

**For issues, check:**
1. MIGRATION_GUIDE.md - Detailed troubleshooting
2. Nginx logs: `/var/log/nginx/`
3. PM2 logs: `pm2 logs`
4. Error logs: `ssh VPS 'tail -50 /var/log/pm2/*.log'`

**Common issues:**
- Blog not loading → Restart blog: `pm2 restart rebelfi-blog`
- Redirect not working → Wait for DNS propagation
- Images broken → Check CDN/Contentful access
- No analytics → Check GA tracking code in page source

