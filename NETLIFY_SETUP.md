# PropIQ Netlify Continuous Deployment Setup

**Site URL**: https://propiq-ai-platform.netlify.app
**Admin Dashboard**: https://app.netlify.com/projects/propiq-ai-platform

---

## ✅ Completed

- [x] Frontend built successfully
- [x] Deployed to Netlify production
- [x] Azure deployment scripts archived
- [x] Site is live at https://propiq-ai-platform.netlify.app

---

## 🔄 Set Up Continuous Deployment (GitHub)

To enable automatic deployments when you push to GitHub, follow these steps:

### **Step 1: Connect to GitHub**

1. Go to **[Netlify Dashboard](https://app.netlify.com/projects/propiq-ai-platform)**
2. Click **Site configuration** in the left sidebar
3. Click **Build & deploy** → **Continuous deployment**
4. Click **Link repository** or **Connect to Git provider**
5. Select **GitHub**
6. Authorize Netlify to access your GitHub account
7. Select repository: **Luntra-HQ/luntra**
8. Select branch: **main**

### **Step 2: Configure Build Settings**

In the build settings, use these values:

```
Base directory: propiq/frontend
Build command: npm run build
Publish directory: propiq/frontend/dist
```

### **Step 3: Environment Variables**

Add these environment variables in **Site configuration** → **Environment variables**:

```bash
# Backend API URL (Azure)
VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net

# Or if you change backend hosting:
# VITE_API_BASE=https://your-backend-url.com

# Application URL
VITE_APP_URL=https://propiq-ai-platform.netlify.app

# Optional: Analytics IDs (if you use them)
# VITE_CLARITY_ID=tts5hc8zf8
# VITE_WANDB_PROJECT=propiq-analysis
```

### **Step 4: Deploy Settings**

Configure these deploy settings:

1. **Production branch**: main
2. **Deploy previews**: Enable for all pull requests
3. **Branch deploys**: Optionally enable for development branches
4. **Build hooks**: Create webhook URL for manual triggers (optional)

---

## 🚀 How Continuous Deployment Works

Once set up, here's the workflow:

### **Automatic Deployment**

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Netlify automatically:
# 1. Detects the push to main
# 2. Pulls the latest code
# 3. Runs npm install
# 4. Runs npm run build
# 5. Deploys to production
# 6. Updates https://propiq-ai-platform.netlify.app
```

### **Deploy Previews (Pull Requests)**

```bash
# Create a new branch
git checkout -b feature/new-calculator

# Make changes and push
git push origin feature/new-calculator

# Create a pull request on GitHub
# Netlify automatically creates a preview URL like:
# https://deploy-preview-123--propiq-ai-platform.netlify.app
```

---

## 🔧 Manual Deployment (Alternative)

If you need to deploy manually without pushing to GitHub:

```bash
cd propiq/frontend

# Deploy to production
netlify deploy --prod

# Deploy to a preview URL (testing)
netlify deploy
```

---

## ⚙️ Environment-Specific Configuration

### **Development (.env.development)**

```bash
VITE_API_BASE=http://localhost:8000
VITE_APP_URL=http://localhost:5173
```

### **Production (Netlify Environment Variables)**

```bash
VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net
VITE_APP_URL=https://propiq-ai-platform.netlify.app
```

---

## 📊 Monitoring Deployments

### **Netlify Dashboard**

- **Deploy log**: https://app.netlify.com/projects/propiq-ai-platform/deploys
- **Build logs**: Click any deployment to see full logs
- **Deploy notifications**: Configure Slack/email notifications

### **Deploy Status Badge (Optional)**

Add to your README:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/[SITE_ID]/deploy-status)](https://app.netlify.com/sites/propiq-ai-platform/deploys)
```

---

## 🎯 Custom Domain Setup (Optional)

To use a custom domain like `app.propiq.com`:

1. Go to **Site configuration** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain: `app.propiq.com`
4. Add DNS records (Netlify will provide instructions)
5. Wait for DNS propagation (up to 24 hours)
6. Netlify automatically provisions SSL certificate

### **DNS Configuration Example**

If you own `propiq.com`:

```
Type: CNAME
Name: app
Value: propiq-ai-platform.netlify.app
```

Or use an A record pointing to Netlify's load balancer:

```
Type: A
Name: @
Value: 75.2.60.5
```

---

## 🔒 Security Best Practices

### **Environment Variables**

- ✅ Store secrets in Netlify environment variables
- ✅ Never commit `.env` files to Git
- ✅ Use `VITE_` prefix for public variables
- ❌ Don't put sensitive keys in VITE_ variables

### **Headers (Already Configured)**

The `netlify.toml` includes security headers:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin`

### **HTTPS**

- ✅ Netlify automatically provisions SSL/TLS certificates
- ✅ HTTP → HTTPS redirects are enabled by default

---

## 🐛 Troubleshooting

### **Build Fails**

1. Check build logs in Netlify dashboard
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are in `dependencies` (not `devDependencies`)
4. Check Node version matches (currently using Node 18)

### **Environment Variables Not Working**

1. Verify variable names have `VITE_` prefix for client-side
2. Rebuild after adding new environment variables
3. Clear deploy cache: **Site configuration** → **Build & deploy** → **Clear cache and retry deploy**

### **API Calls Failing**

1. Check CORS settings on backend
2. Verify `VITE_API_BASE` is set correctly
3. Check browser console for errors
4. Verify backend is deployed and accessible

### **Routing Issues (404 on refresh)**

- ✅ Already configured in `netlify.toml`:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

---

## 📈 Performance Optimization

### **Cache Configuration**

Already configured in `netlify.toml`:

```toml
# HTML: No cache (always fresh)
Cache-Control: public, max-age=0, must-revalidate

# Assets (JS/CSS): 1 year cache
Cache-Control: public, max-age=31536000, immutable
```

### **Build Optimizations**

Consider adding to `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'styled-components']
        }
      }
    }
  }
})
```

### **Image Optimization**

Use Netlify's built-in image optimization:

```html
<img src="/.netlify/images?url=/image.jpg&w=800&q=80" />
```

---

## 🔗 Useful Links

- **Site**: https://propiq-ai-platform.netlify.app
- **Admin**: https://app.netlify.com/projects/propiq-ai-platform
- **Deploys**: https://app.netlify.com/projects/propiq-ai-platform/deploys
- **Build logs**: https://app.netlify.com/projects/propiq-ai-platform/logs
- **Netlify Docs**: https://docs.netlify.com
- **GitHub Repo**: https://github.com/Luntra-HQ/luntra

---

## ✅ Quick Start Checklist

- [ ] Connect GitHub repository in Netlify dashboard
- [ ] Configure build settings (base: `propiq/frontend`, build: `npm run build`)
- [ ] Add environment variables (VITE_API_BASE, VITE_APP_URL)
- [ ] Test automatic deployment (push a small change to main)
- [ ] Verify site works at https://propiq-ai-platform.netlify.app
- [ ] Optional: Set up custom domain
- [ ] Optional: Configure deploy notifications

---

**Last Updated**: 2025-10-22
**Deployed By**: Claude Code (Anthropic)
