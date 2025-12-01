# 🎮 Installing the Karma Chrome Extension

The Chrome extension shows vibe scores directly on Steam profiles!

## Installation Steps

### 1. Open Chrome Extensions Page
- Open Google Chrome
- Go to `chrome://extensions/`
- Or click the puzzle icon → "Manage Extensions"

### 2. Enable Developer Mode
- Toggle "Developer mode" ON in the top-right corner

### 3. Load the Extension
- Click **"Load unpacked"** button
- Navigate to your CSKarma project folder
- Select the `extension` folder
- Click "Select Folder"

### 4. Verify Installation
- You should see "Karma (Vibe Check) - Steam Overlay" in your extensions list
- The extension should be enabled (toggle switch is blue)

## Using the Extension

### Viewing Vibe Scores
1. Go to any Steam profile:
   - `https://steamcommunity.com/id/username`
   - `https://steamcommunity.com/profiles/76561198012345678`

2. The extension will automatically show:
   - **Vibe Score badge** next to the player's name
   - **Warning badge** if the player has been flagged as toxic
   - **"Rate Player" button** to submit your own rating

### Rating a Player
1. Click the **"Rate Player"** button on any Steam profile
2. Choose from the rating options:
   - 😊 **Helpful** - Positive, team player
   - ⚠️ **Toxic** - Negative, abusive behavior
   - 🔇 **No Mic** - Doesn't communicate
   - 😡 **Rager** - Gets angry easily

3. Your rating is submitted and will affect their vibe score!

## Features

✅ **Instant Overlay** - Vibe scores appear automatically on Steam profiles
✅ **One-Click Ratings** - Rate players with a single click
✅ **Toxic Warnings** - Get alerted about toxic players
✅ **Anonymous Voting** - Ratings are anonymous for your safety

## Troubleshooting

### Extension Not Working?
1. **Refresh the Steam page** - Press F5 or Ctrl+R
2. **Check if enabled** - Make sure the extension toggle is ON in `chrome://extensions/`
3. **Reload extension** - Click the refresh icon on the extension card
4. **Check console** - Press F12 → Console tab to see any errors

### Vibe Score Not Showing?
- The player might not have any ratings yet
- Make sure you're on a valid Steam profile page
- Check that the backend is running at https://cskarma-production.up.railway.app

### Can't Submit Ratings?
- Check your internet connection
- Make sure the backend is accessible
- Check browser console (F12) for error messages

## Backend Configuration

The extension is currently configured to use:
- **Production Backend**: `https://cskarma-production.up.railway.app`

If you need to change this, edit `extension/contentScript.js` line 2:
```javascript
const BACKEND_URL = 'https://your-backend-url.com';
```

Then reload the extension in Chrome.

## Publishing to Chrome Web Store (Optional)

To make the extension available for others:

1. Create a ZIP file of the `extension` folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time $5 developer fee
4. Click "New Item" and upload your ZIP file
5. Fill out the listing details
6. Submit for review

**Note**: Chrome Web Store review can take 1-3 days.

## Privacy & Security

- ✅ Extension only runs on Steam profile pages
- ✅ No personal data is collected
- ✅ Ratings are anonymous
- ✅ All communication uses HTTPS
- ✅ No tracking or analytics

---

**Need Help?** Check the [main README](README.md) or open an issue on GitHub!
