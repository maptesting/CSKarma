# 🚀 Deployment Guide for CSKarma

Complete guide to deploy CSKarma to production with a custom domain.

---

## 📋 Deployment Architecture

- **Frontend**: Vercel (Next.js) → `cskarma.vercel.app` → Your custom domain
- **Backend**: Railway (Node.js/Express) → `your-app.up.railway.app`
- **Database**: Supabase (already hosted)
- **Extension**: Chrome Web Store

---

## 🎯 Step 1: Push to GitHub

### Initialize Git and Push

```bash
cd d:\AOS\cs2\CSKarma

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CSKarma SaaS platform"

# Create repository on GitHub (do this first on github.com)
# Then connect and push:
git remote add origin https://github.com/maptesting/CSKarma.git
git branch -M main
git push -u origin main
```

**GitHub Repository**: https://github.com/maptesting/CSKarma

---

## 🌐 Step 2: Deploy Frontend to Vercel

### Via Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/login (sign in with GitHub)

2. **Click "Add New Project"**

3. **Import your repository**: `maptesting/CSKarma`

4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. **Environment Variables** (click "Add" for each):
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.up.railway.app
   ```
   (You'll get this URL in Step 3, come back and update it)

6. **Click "Deploy"**

7. **Your site will be live at**: `cskarma.vercel.app` or `cskarma-xyz.vercel.app`

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to web folder
cd web

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: CSKarma
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## 🚂 Step 3: Deploy Backend to Railway

### Via Railway Dashboard (Recommended)

1. **Go to**: https://railway.app (sign in with GitHub)

2. **Click "New Project"**

3. **Select "Deploy from GitHub repo"**

4. **Choose**: `maptesting/CSKarma`

5. **Configure Service**:
   - Click "Add Variables"
   - Add all environment variables:

   ```env
   PORT=4000
   NODE_ENV=production

   # Frontend URL (your Vercel URL from Step 2)
   FRONTEND_URL=https://cskarma.vercel.app

   # Session Secret
   SESSION_SECRET=your-super-secure-random-string-here

   # Supabase
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-key

   # Steam API
   STEAM_API_KEY=your-steam-api-key
   STEAM_RETURN_URL=https://your-app.up.railway.app/auth/steam/return
   STEAM_REALM=https://your-app.up.railway.app/
   ```

6. **Settings**:
   - **Root Directory**: `backend`
   - **Start Command**: `npm run build && npm start`
   - **Install Command**: `npm install`

7. **Click "Deploy"**

8. **Get your Railway URL**: Click "Settings" → "Generate Domain"
   - Example: `cskarma-backend-production.up.railway.app`

9. **Copy this URL and update**:
   - Go back to Vercel → Settings → Environment Variables
   - Update `NEXT_PUBLIC_BACKEND_URL` to your Railway URL
   - Redeploy Vercel frontend

---

## 🔐 Step 4: Update Steam API Settings

Since you're now using production URLs, update your Steam API settings:

1. **Go to**: https://steamcommunity.com/dev/apikey

2. **Update Domain Name**:
   - Change from `localhost` to your Railway backend domain
   - Example: `cskarma-backend-production.up.railway.app`

3. **Update STEAM_RETURN_URL in Railway**:
   ```
   STEAM_RETURN_URL=https://your-railway-domain.up.railway.app/auth/steam/return
   STEAM_REALM=https://your-railway-domain.up.railway.app/
   ```

---

## 🌍 Step 5: Add Custom Domain (Optional)

### For Vercel (Frontend)

1. **Buy a domain** (Namecheap, Google Domains, etc.)
   - Example: `cskarma.gg` or `vibecheck.gg`

2. **In Vercel Dashboard**:
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain: `cskarma.gg`
   - Follow DNS instructions

3. **Add DNS Records** (in your domain provider):
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

4. **Wait for DNS propagation** (5-60 minutes)

### For Railway (Backend)

1. **In Railway Dashboard**:
   - Go to your service → Settings
   - Click "Generate Domain" (you get a free `.up.railway.app` domain)
   - Or add custom domain (paid plan required)

---

## 📦 Step 6: Update Extension for Production

### Update Backend URL in Extension

Edit `extension/contentScript.js`:

```javascript
// Change this line:
const BACKEND_URL = 'http://localhost:4000';

// To your production backend:
const BACKEND_URL = 'https://your-railway-domain.up.railway.app';
```

### Update Manifest for Production

Edit `extension/manifest.json`:

```json
{
  "host_permissions": [
    "https://steamcommunity.com/id/*",
    "https://steamcommunity.com/profiles/*",
    "https://your-railway-domain.up.railway.app/*"
  ]
}
```

---

## ✅ Step 7: Verify Deployment

### Test Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend API responds: `https://your-railway-url/api/users`
- [ ] Steam login works (redirects properly)
- [ ] Search finds users
- [ ] Extension shows vibe scores on Steam profiles
- [ ] Votes can be submitted
- [ ] No CORS errors in browser console

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Add Vercel URL to `FRONTEND_URL` in Railway |
| Steam login redirects to localhost | Update `STEAM_RETURN_URL` and `STEAM_REALM` in Railway |
| Extension can't connect | Add Railway URL to extension `host_permissions` |
| Database errors | Check Supabase credentials in Railway |

---

## 🔄 Step 8: Set Up Auto-Deploy

### Vercel (Automatic)
- Already set up! Every push to `main` branch auto-deploys

### Railway (Automatic)
- Already set up! Every push to `main` branch auto-deploys

### Workflow:
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel and Railway automatically deploy!
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Go to your project → Analytics
- See real-time visitors, page views

### Railway Logs
- Go to your service → Deployments → View Logs
- Monitor API requests, errors

### Supabase
- Database Dashboard → View queries, usage

---

## 💰 Pricing (Free Tiers)

| Service | Free Tier | Upgrade When |
|---------|-----------|--------------|
| **Vercel** | 100GB bandwidth/month | > 10K visitors/month |
| **Railway** | $5 free credit/month | Heavy API usage |
| **Supabase** | 500MB database, 2GB bandwidth | > 50K users |

**Total Cost**: $0/month for MVP, scales as you grow

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Railway
- [ ] Steam API key updated with production domain
- [ ] Extension updated with production backend URL
- [ ] Database tables created in Supabase
- [ ] Test data added (optional)
- [ ] SSL/HTTPS working (automatic on Vercel/Railway)
- [ ] CORS configured correctly
- [ ] Session cookies set to `secure: true` in production
- [ ] Custom domain configured (optional)
- [ ] Error tracking set up (Sentry - optional)

---

## 🚀 Quick Commands

```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Update feature"
git push origin main

# Check Vercel deployment
vercel ls

# Check Railway logs
railway logs

# Rollback Vercel (if needed)
vercel rollback

# Rollback Railway (if needed)
# Go to Dashboard → Deployments → Redeploy previous version
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Steam Web API**: https://steamcommunity.com/dev

---

## 🎉 You're Live!

Once deployed, your URLs will be:

- **Frontend**: https://cskarma.vercel.app (or your custom domain)
- **Backend**: https://your-app.up.railway.app
- **Extension**: Submit to Chrome Web Store

**Share your project**:
- Tweet: "Just launched CSKarma - vibe check for Steam players! 🎮"
- Reddit: r/GlobalOffensive, r/Steam
- Discord: Gaming servers

---

**Need help?** Check the troubleshooting section or reach out to the community!
