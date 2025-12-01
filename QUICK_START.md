# ⚡ Quick Start Guide

Get CSKarma running in **5 minutes**!

---

## 🏃 Speed Run Setup

### 1️⃣ Install Dependencies (1 min)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../web
npm install
```

### 2️⃣ Set Environment Variables (2 min)

**Backend** (`backend/.env`):
```env
PORT=4000
SESSION_SECRET=your-random-secret-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
STEAM_API_KEY=your-steam-key
STEAM_RETURN_URL=http://localhost:4000/auth/steam/return
STEAM_REALM=http://localhost:4000/
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`web/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

**Get your keys:**
- Supabase: https://supabase.com → New Project → Settings → API
- Steam API: https://steamcommunity.com/dev/apikey

### 3️⃣ Create Database Tables (1 min)

In Supabase SQL Editor, run:

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

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  target_id UUID REFERENCES users(id),
  match_id TEXT,
  tag TEXT NOT NULL,
  optional_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4️⃣ Run the App (1 min)

**Terminal 1** (Backend):
```bash
cd backend
npm run dev
```

**Terminal 2** (Frontend):
```bash
cd web
npm run dev
```

### 5️⃣ Test Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **"Load unpacked"** → Select `extension` folder
4. Visit any Steam profile → See vibe score overlay!

---

## ✅ You're Done!

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Extension**: Loaded in Chrome

---

## 🧪 Quick Test

Create a test user:
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"steam_id": "test123", "username": "TestPlayer"}'
```

Search for them at: http://localhost:3000/search

---

## 🐛 Issues?

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed troubleshooting.

---

**Next Steps:**
- Read [FEATURE_IDEAS.md](FEATURE_IDEAS.md) for growth ideas
- Deploy to production (Vercel + Railway)
- Start building! 🚀
