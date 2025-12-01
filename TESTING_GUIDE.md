# 🧪 CSKarma Testing Guide

Complete guide to testing and running the CSKarma application locally.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ and npm installed
- **Supabase** account and project set up
- **Steam API Key** from https://steamcommunity.com/dev/apikey
- **Chrome** or **Chromium-based browser** (for extension testing)
- **Git** (optional, for version control)

---

## ⚙️ Environment Setup

### 1. Backend Configuration

Navigate to the backend directory and create your `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual credentials:

```env
PORT=4000
NODE_ENV=development

# Frontend URL (comma-separated for multiple origins)
FRONTEND_URL=http://localhost:3000

# Session Secret (REQUIRED - use a strong random string)
SESSION_SECRET=your-super-secret-random-string-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Steam OAuth Configuration
STEAM_API_KEY=your-steam-api-key-here
STEAM_RETURN_URL=http://localhost:4000/auth/steam/return
STEAM_REALM=http://localhost:4000/
```

**How to get credentials:**

- **SESSION_SECRET**: Generate using `openssl rand -base64 32` or any random string generator
- **SUPABASE_URL & KEY**: From your Supabase project settings → API
- **STEAM_API_KEY**: Register at https://steamcommunity.com/dev/apikey

### 2. Frontend Configuration

Navigate to the web directory and create your `.env.local` file:

```bash
cd ../web
cp .env.local.example .env.local
```

Edit `web/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 3. Database Setup

Create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_id TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_steam_id ON users(steam_id);
```

#### Votes Table
```sql
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

#### Subscriptions Table (Optional for future)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_id TEXT,
  status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Mods Table (Optional for future)
```sql
CREATE TABLE mods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Running the Application

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../web
npm install
```

### Step 2: Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Karma backend running at http://localhost:4000
```

### Step 3: Start the Frontend

In a **new terminal**:

```bash
cd web
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
```

### Step 4: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

---

## 🧩 Testing the Chrome Extension

### 1. Load Extension in Developer Mode

1. Open **Chrome** and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `d:\AOS\cs2\CSKarma\extension` directory
5. The extension icon should appear in your toolbar

### 2. Verify Extension Permissions

After loading, check:
- ✅ Extension has permission to access `steamcommunity.com`
- ✅ Extension has permission to access `localhost:4000` (for API calls)
- ✅ Storage permission is granted

### 3. Test Extension Functionality

#### Test 1: Profile Overlay
1. Navigate to any Steam profile:
   - Example: https://steamcommunity.com/id/gabelogannewell
   - Or: https://steamcommunity.com/profiles/76561197960287930

2. **Expected behavior:**
   - You should see a "Vibe Score" badge appear near the player's name
   - A "Rate Player" button should be visible
   - Score displays as `?/5` if no ratings exist

#### Test 2: Vote Submission
1. Click the **"Rate Player"** button
2. A modal should appear with options: Helpful, Toxic, No Mic, Rager
3. Click any rating (e.g., "Helpful")
4. **Expected behavior:**
   - Modal shows "Thank you for your feedback!"
   - Modal closes after 1.3 seconds
   - Vote is saved to database

5. **Verify in backend:**
   ```bash
   # Check if vote was created
   curl http://localhost:4000/api/votes/user/[user-id]
   ```

#### Test 3: Score Aggregation
1. Submit multiple votes for the same player (use different tags)
2. Refresh the Steam profile page
3. **Expected behavior:**
   - Vibe score updates to reflect average
   - Score color changes based on value:
     - Green: 4.0-5.0 (Good)
     - Orange: 2.5-3.9 (Medium)
     - Red: 0-2.4 (Toxic)

#### Test 4: Toxic Warning
1. Create 10+ "Toxic" votes for a user (you can use the API directly)
2. Visit their Steam profile
3. **Expected behavior:**
   - Red badge with warning message appears
   - Message: "Warning: flagged as toxic by X users in the last month!"

### 4. Debugging the Extension

If the extension doesn't work:

1. **Check console errors:**
   - Right-click the extension icon → "Inspect popup"
   - Or: On Steam profile, press F12 → Check Console tab

2. **Common issues:**
   - **CORS errors**: Make sure backend FRONTEND_URL includes extension origin
   - **No overlay appears**: Check if Steam changed their profile HTML structure
   - **API calls fail**: Ensure backend is running on port 4000
   - **Permission denied**: Reload extension after granting permissions

3. **View background script logs:**
   - Go to `chrome://extensions/`
   - Find CSKarma extension
   - Click "Inspect views: service worker"

### 5. Extension Test Data

Create test users and votes using the API:

```bash
# Create a test user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"steam_id": "76561197960287930", "username": "TestUser"}'

# Create a vote
curl -X POST http://localhost:4000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_id": "[reporter-uuid]",
    "target_id": "[target-uuid]",
    "match_id": "/profiles/test",
    "tag": "Helpful"
  }'
```

---

## 🔍 Testing Frontend Features

### Home Page
1. Visit http://localhost:3000
2. **Verify:**
   - ✅ Modern gradient background loads
   - ✅ "Login with Steam" button works
   - ✅ Features grid displays 6 cards
   - ✅ Stats section shows 3 metrics
   - ✅ Navbar is sticky on scroll

### Search Page
1. Visit http://localhost:3000/search
2. **Test search functionality:**
   - Enter a Steam ID or username
   - Press Enter or click "Search" button
3. **Expected behavior:**
   - Loading indicator appears
   - If user exists: Shows vibe score, tags, and warning (if applicable)
   - If user doesn't exist: Shows "User not found" error
   - Vibe score has colored badge (green/orange/red)

### Admin Dashboard
1. Visit http://localhost:3000/admin
2. **Verify:**
   - Tables load (may be empty if no data)
   - "Flagged Users" table displays
   - "Recent Comments/Reports" table displays
   - Action buttons are clickable

---

## 🧪 API Testing

### Test with cURL

#### Get all users:
```bash
curl http://localhost:4000/api/users
```

#### Get user by ID:
```bash
curl http://localhost:4000/api/users/[user-id]
```

#### Get aggregate vibe score:
```bash
curl http://localhost:4000/api/votes/aggregate/[user-id]
```

#### Get all votes for a user:
```bash
curl http://localhost:4000/api/votes/user/[user-id]
```

### Test Steam Authentication

1. Click "Login with Steam" button
2. You'll be redirected to Steam's OAuth page
3. Authorize the app
4. **Expected behavior:**
   - Redirected back to http://localhost:3000
   - User is logged in (check session)
   - User record created in database

---

## 🐛 Common Issues & Solutions

### Backend Issues

| Issue | Solution |
|-------|----------|
| `SESSION_SECRET is required` | Set SESSION_SECRET in backend/.env |
| `SUPABASE_URL is required` | Add Supabase credentials to .env |
| Port 4000 already in use | Kill the process: `lsof -ti:4000 \| xargs kill -9` (Mac/Linux) or change PORT in .env |
| CORS errors | Add frontend URL to FRONTEND_URL in .env |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| Can't connect to backend | Ensure NEXT_PUBLIC_BACKEND_URL is set in .env.local |
| Page styles not loading | Clear browser cache and restart dev server |
| 404 on routes | Restart Next.js dev server |

### Extension Issues

| Issue | Solution |
|-------|----------|
| Extension doesn't load | Check for errors in chrome://extensions |
| No overlay on Steam | Check if profile page HTML structure matches selectors |
| API calls blocked | Add localhost:4000 to manifest.json host_permissions |
| Votes not saving | Check browser console for API errors |

---

## ✅ Verification Checklist

Before considering your setup complete:

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Database tables created in Supabase
- [ ] Steam login works (OAuth flow completes)
- [ ] Extension loads in Chrome without errors
- [ ] Extension overlay appears on Steam profiles
- [ ] Voting functionality works (submit & save votes)
- [ ] Search page finds users and displays scores
- [ ] Vibe score calculation is accurate
- [ ] Toxic warnings appear for flagged users

---

## 📊 Performance Testing

### Load Testing (Optional)

Test with multiple concurrent votes:

```bash
# Install artillery (load testing tool)
npm install -g artillery

# Create test-votes.yml
cat > test-votes.yml << EOF
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Submit votes'
    flow:
      - post:
          url: '/api/votes'
          json:
            reporter_id: 'test-uuid'
            target_id: 'test-uuid-2'
            match_id: 'test-match'
            tag: 'Helpful'
EOF

# Run test
artillery run test-votes.yml
```

---

## 🎯 Next Steps After Testing

Once everything works:

1. **Deploy to production:**
   - Set up hosting (Vercel for frontend, Railway/Render for backend)
   - Update environment variables for production URLs
   - Enable HTTPS and update cookie settings

2. **Publish extension:**
   - Package extension for Chrome Web Store
   - Update manifest.json with production API URL
   - Submit for review

3. **Monitor & improve:**
   - Set up error tracking (Sentry)
   - Add analytics (PostHog, Mixpanel)
   - Collect user feedback

---

## 🤝 Need Help?

If you encounter issues:

1. Check the console logs (browser & terminal)
2. Verify all environment variables are set correctly
3. Ensure all services are running
4. Check the database for data consistency

Happy testing! 🚀
