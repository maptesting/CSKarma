# 🚀 GitHub & Deployment Setup

**Status**: ✅ Code is committed and ready to push! Just need to create the GitHub repository.

---

## Step 1: Create GitHub Repository

1. **Go to**: https://github.com/new
2. **Repository name**: `CSKarma` (exactly this name)
3. **Description**: `Community-powered player reputation system for CS2 & Steam`
4. **Visibility**: Choose **Public** or **Private**
5. **Important**: Do NOT initialize with README, .gitignore, or license (we already have these)
6. **Click**: "Create repository"

---

## Step 2: Push Code to GitHub

Once you've created the repository, run these commands:

```bash
cd d:/AOS/cs2/CSKarma
git remote add origin https://github.com/maptesting/CSKarma.git
git push -u origin main
```

**Expected output**:
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
Writing objects: 100% (50/50), done.
Total 50 (delta 0), reused 0 (delta 0)
To https://github.com/maptesting/CSKarma.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## Step 3: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com/new
2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select `maptesting/CSKarma`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `web` ← **IMPORTANT!**
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Environment Variables** (click "Environment Variables"):
   ```
   NEXT_PUBLIC_BACKEND_URL = https://your-backend-url.railway.app
   ```
   *(You'll update this after deploying backend)*

5. **Click "Deploy"**

6. **Once deployed**:
   - Copy your Vercel URL (e.g., `https://cskarma.vercel.app`)
   - You'll need this for the backend configuration

---

## Step 4: Deploy Backend to Railway

1. **Go to**: https://railway.app/new
2. **Click**: "Deploy from GitHub repo"
3. **Select**: `maptesting/CSKarma`

4. **IMPORTANT - Set Root Directory**:
   - Click on your service
   - Go to **Settings** tab
   - Scroll to **Service Settings**
   - Find **Root Directory**
   - Set it to: `backend` ← **CRITICAL!**
   - Click "Update"

5. **Configure Build** (should auto-detect from nixpacks.toml):
   - Builder: Nixpacks
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Add Environment Variables** (click "Variables" tab):
   ```
   NODE_ENV=production
   PORT=4000

   # Frontend URL (from Vercel)
   FRONTEND_URL=https://cskarma.vercel.app

   # Session Secret (generate with: openssl rand -base64 32)
   SESSION_SECRET=your-super-secret-random-string-min-32-chars

   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Steam API
   STEAM_API_KEY=your-steam-api-key-here
   STEAM_RETURN_URL=https://your-backend-url.railway.app/auth/steam/return
   STEAM_REALM=https://your-backend-url.railway.app/
   ```

6. **Click "Deploy"**

7. **Once deployed**:
   - Copy your Railway URL (e.g., `https://cskarma-production.up.railway.app`)
   - Go back to Vercel and update `NEXT_PUBLIC_BACKEND_URL` with this URL
   - Redeploy Vercel frontend

---

## Step 5: Update Extension for Production

Once both are deployed, update the extension to use production URLs:

### **extension/contentScript.js** (line 2):
```javascript
const BACKEND_URL = 'https://your-backend-url.railway.app';
```

### **extension/manifest.json** (line 12):
```json
"host_permissions": [
  "https://your-backend-url.railway.app/*",
  "https://steamcommunity.com/*"
]
```

Then reload the extension in Chrome.

---

## Step 6: Add Custom Domain (Optional)

### **For Vercel (Frontend)**:
1. Go to your project settings → "Domains"
2. Add your custom domain (e.g., `cskarma.com`)
3. Update DNS records as instructed by Vercel

### **For Railway (Backend)**:
1. Go to your project settings → "Domains"
2. Add custom domain (e.g., `api.cskarma.com`)
3. Update DNS records as instructed by Railway

Then update all environment variables with your custom domains.

---

## 🎯 Quick Checklist

- [ ] Created GitHub repository at https://github.com/maptesting/CSKarma
- [ ] Pushed code to GitHub
- [ ] Deployed backend to Railway
- [ ] Deployed frontend to Vercel
- [ ] Updated `NEXT_PUBLIC_BACKEND_URL` in Vercel with Railway URL
- [ ] Updated `FRONTEND_URL` in Railway with Vercel URL
- [ ] Updated `STEAM_RETURN_URL` and `STEAM_REALM` in Railway
- [ ] Updated extension files with production URLs
- [ ] Tested login with Steam
- [ ] Tested search functionality
- [ ] Tested extension on Steam profiles
- [ ] (Optional) Added custom domain

---

## 🐛 Troubleshooting

### **Issue: "Repository not found"**
- Make sure you created the repository on GitHub first
- Repository name must be exactly `CSKarma`
- Use the correct remote URL

### **Issue: Vercel build fails**
- Make sure Root Directory is set to `web`
- Check build logs for specific errors
- Ensure Node.js version is 18+ (set in project settings)

### **Issue: Railway deployment fails**
- Make sure Root Directory is set to `backend`
- Check all environment variables are set correctly
- Look at deployment logs for specific errors

### **Issue: CORS errors after deployment**
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Update CORS settings if using custom domain
- Check browser console for specific CORS errors

### **Issue: Steam login doesn't work in production**
- Update `STEAM_RETURN_URL` to match your Vercel domain
- Update `STEAM_REALM` to match your Vercel domain
- Register your production domain at https://steamcommunity.com/dev/apikey

---

## 📝 What I've Already Done

✅ Initialized Git repository
✅ Committed all 42 files
✅ Renamed branch to `main`
✅ Created `railway.json` for backend deployment
✅ Created `vercel.json` for frontend deployment
✅ Created complete deployment documentation

**Next**: You just need to create the GitHub repository and follow the steps above! 🚀

---

**Need help?** All your configuration files are ready. Just follow the steps in order and you'll be live in ~15 minutes!
