# 🚀 Complete Setup Instructions

Follow these steps **in order** to get CSKarma running.

---

## ✅ Step 1: Get Your Steam API Key

1. **Visit**: https://steamcommunity.com/dev/apikey
2. **Sign in** with your Steam account
3. **Fill in the form**:
   - **Domain Name**: Enter `localhost` (for development)
   - **Agree to Steam Web API Terms**: Check the box
4. **Click "Register"**
5. **Copy your API key** - it looks like this: `A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6`

---

## ✅ Step 2: Set Up Supabase

1. **Go to**: https://supabase.com
2. **Create a new project** (or use existing)
3. **Create the database tables**:
   - Go to **SQL Editor** in Supabase dashboard
   - Run this SQL:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_id TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_steam_id ON users(steam_id);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id TEXT,
  tag TEXT NOT NULL CHECK (tag IN ('Toxic', 'Helpful', 'No Mic', 'Rager')),
  optional_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_votes_target ON votes(target_id);
CREATE INDEX idx_votes_reporter ON votes(reporter_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);
```

4. **Get your Supabase credentials**:
   - Go to **Settings → API**
   - Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy **service_role key** (NOT the anon key!)

---

## ✅ Step 3: Configure Environment Variables

### **Backend (.env)**

Create/edit `backend/.env`:

```env
# Server
PORT=4000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-super-secret-random-string-min-32-chars

# Supabase (from Step 2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Steam (from Step 1)
STEAM_API_KEY=your-steam-api-key-here
STEAM_RETURN_URL=http://localhost:4000/auth/steam/return
STEAM_REALM=http://localhost:4000/
```

### **Frontend (.env.local)**

Create/edit `web/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

## ✅ Step 4: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../web
npm install
```

---

## ✅ Step 5: Add Test Data (Important!)

This creates sample users and votes so you can test the search feature:

```bash
cd backend
node test-data.js
```

You should see:
```
✅ Test data added successfully!

🔍 Try searching for these users:
   - "baduser" (should show low vibe score)
   - "goodguy" (should show high vibe score)
   - "76561197960287930" (Gabe Newell)
```

---

## ✅ Step 6: Run the Application

### **Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Karma backend running at http://localhost:4000
```

### **Terminal 2 - Frontend:**
```bash
cd web
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

---

## ✅ Step 7: Test Everything

### **Test 1: Frontend Loads**
1. Open: http://localhost:3000
2. You should see the modern landing page with gradient background

### **Test 2: Search Works**
1. Go to: http://localhost:3000/search
2. Search for: `baduser`
3. You should see:
   - Username: ToxicTom
   - Low vibe score (red badge)
   - Tags: Toxic, Rager

### **Test 3: Steam Login**
1. Click "Login with Steam" button
2. You'll be redirected to Steam
3. Authorize the app
4. You'll be redirected back to localhost:3000
5. You're now logged in!

### **Test 4: Extension**
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `d:\AOS\cs2\CSKarma\extension`
5. Visit: https://steamcommunity.com/profiles/76561197960287930
6. You should see vibe score badge!

---

## 🐛 Troubleshooting

### **Issue: "SESSION_SECRET is required"**
**Fix**: Make sure you set `SESSION_SECRET` in `backend/.env`
```bash
# Generate one with:
openssl rand -base64 32
```

### **Issue: "Failed to fetch user info"**
**Causes**:
1. Backend not running → Start with `npm run dev` in backend folder
2. No test data → Run `node test-data.js` in backend folder
3. Wrong Supabase credentials → Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### **Issue: Steam login doesn't work**
**Causes**:
1. Wrong Steam API key → Get it from https://steamcommunity.com/dev/apikey
2. Wrong return URL → Should be `http://localhost:4000/auth/steam/return`
3. Backend not running → Start backend first

### **Issue: Extension doesn't show overlay**
**Causes**:
1. Backend not running → Extension needs API at localhost:4000
2. No data for that user → Try Gabe Newell's profile: https://steamcommunity.com/profiles/76561197960287930
3. Extension not loaded → Reload extension in `chrome://extensions/`

---

## 📝 Quick Reference

### **Test Users (after running test-data.js):**
- `baduser` - Toxic player (low score)
- `goodguy` - Helpful player (high score)
- `76561197960287930` - Gabe Newell (Steam founder)

### **URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API Docs: http://localhost:4000/api/users
- Steam API Key: https://steamcommunity.com/dev/apikey

### **Commands:**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd web && npm run dev

# Add test data
cd backend && node test-data.js

# Check backend is running
curl http://localhost:4000

# Check users exist
curl http://localhost:4000/api/users
```

---

## ✨ You're All Set!

Once you see:
- ✅ Backend running on :4000
- ✅ Frontend running on :3000
- ✅ Search finds "baduser" and "goodguy"
- ✅ Steam login works
- ✅ Extension shows badges on Steam profiles

**You're ready to build! 🚀**

---

## 🎯 Next Steps

1. **Customize**: Change colors, add your branding
2. **Add features**: See [FEATURE_IDEAS.md](FEATURE_IDEAS.md)
3. **Deploy**: Push to production (Vercel + Railway)
4. **Grow**: Share with gaming community!

---

**Need help?** Check [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed troubleshooting.
