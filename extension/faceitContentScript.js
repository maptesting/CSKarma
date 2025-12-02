// Configuration
const BACKEND_URL = 'https://cskarma-production.up.railway.app';

console.log('🛡️ CommSafe Faceit extension loaded! URL:', window.location.href);

// Where to inject on Faceit profile
function getPlayerNameElement() {
  // Faceit profile page selectors - try multiple approaches
  const selectors = [
    // New Faceit design
    'div[class*="profile-header"] h2',
    'div[class*="profile-header"] h1',
    '[class*="username"]',
    '[class*="nickname"]',
    '[class*="player-header"] h1',
    '[class*="player-header"] h2',
    // Old Faceit design
    '[data-testid="profile-name"]',
    '.profile-name',
    'h1.main-header__title',
    'div[class*="ProfileHeader"] h1',
    // Fallback to any h1 or h2 near top of page
    'main h1',
    'main h2'
  ];

  console.log('🔍 Searching for player name element...');

  for (const selector of selectors) {
    const elem = document.querySelector(selector);
    if (elem) {
      console.log('✅ Found player name element using selector:', selector);
      console.log('✅ Element text:', elem.textContent);
      return elem;
    }
  }

  console.log('❌ Could not find player name element with any selector');
  console.log('📋 Available elements:', document.body.innerHTML.substring(0, 500));
  return null;
}

function createBadge(score, warningText) {
  const badge = document.createElement('span');
  badge.className = 'karma-vibe-badge faceit-badge';
  badge.textContent = `Vibe Score: ${score ?? '?'}/5`;
  if (warningText) {
    badge.textContent += ` | ${String(warningText).replace(/[<>]/g, '')}`;
    badge.style.background = '#f43f5e';
  }
  return badge;
}

function createVoteBtn(faceitId, nickname) {
  const btn = document.createElement('button');
  btn.className = 'karma-vibe-badge faceit-vote-btn';
  btn.style.background = '#7836ff';
  btn.innerText = 'Rate Player';
  btn.onclick = () => openVoteModal(faceitId, nickname);
  return btn;
}

function injectOverlay(score, warning, faceitId, nickname) {
  console.log('💉 injectOverlay called with:', { score, warning, faceitId, nickname });

  const nameElem = getPlayerNameElement();
  console.log('👤 Player name element:', nameElem);

  if (!nameElem) {
    console.log('❌ No player name element found, cannot inject');
    return;
  }

  if (document.getElementById('karma-vibe-root')) {
    console.log('⚠️ Already injected, skipping');
    return;
  }

  const root = document.createElement('div');
  root.id = 'karma-vibe-root';
  root.style.marginTop = '10px';
  root.appendChild(createBadge(score, warning));
  root.appendChild(createVoteBtn(faceitId, nickname));

  // Insert after the name element
  nameElem.parentNode.insertBefore(root, nameElem.nextSibling);

  console.log('✅ Successfully injected vibe badge!');
}

function openVoteModal(faceitId, nickname) {
  if (document.getElementById('karma-vibe-modal')) return;
  const modal = document.createElement('div');
  modal.className = 'karma-vibe-modal';
  modal.id = 'karma-vibe-modal';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'karma-vibe-close';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => modal.remove();

  const title = document.createElement('h3');
  title.textContent = 'How was this player\'s vibe?';

  const subtitle = document.createElement('p');
  subtitle.textContent = `Rating ${nickname} on Faceit`;
  subtitle.style.fontSize = '14px';
  subtitle.style.color = '#999';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '20px';

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(subtitle);
  modal.appendChild(buttonContainer);

  ['Helpful', 'Team Player', 'Friendly', 'Skilled', 'Toxic', 'Rager', 'No Mic', 'AFK', 'Cheater'].forEach(type => {
    const b = document.createElement('button');
    b.textContent = type;
    b.onclick = async () => {
      try {
        await sendVote(type, faceitId, nickname);
        modal.innerHTML = '';
        const successMsg = document.createElement('b');
        successMsg.textContent = 'Thank you for your feedback!';
        modal.appendChild(successMsg);
        setTimeout(() => modal.remove(), 1300);
      } catch (e) {
        modal.innerHTML = '';
        const errorMsg = document.createElement('b');
        errorMsg.textContent = 'Error submitting vote.';
        errorMsg.style.color = 'red';
        modal.appendChild(errorMsg);
        setTimeout(() => modal.remove(), 2000);
      }
    };
    buttonContainer.appendChild(b);
  });
  document.body.appendChild(modal);
}

async function sendVote(tag, faceitId, nickname) {
  // Get or create reporter
  let reporter_id = localStorage.getItem('karma-reporter-id');
  if (!reporter_id) {
    const steam_id = Math.random().toString().slice(2, 12);
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steam_id })
    });
    if (!res.ok) throw new Error('Failed to create reporter');
    const data = await res.json();
    reporter_id = data.id;
    localStorage.setItem('karma-reporter-id', reporter_id);
  }

  // Look up or create target user with Faceit ID
  let target_id = localStorage.getItem('karma-faceit-' + faceitId);
  if (!target_id) {
    const res2 = await fetch(`${BACKEND_URL}/api/users/faceit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceit_id: faceitId, nickname: nickname })
    });
    if (!res2.ok) throw new Error('Failed to create target user');
    const data2 = await res2.json();
    target_id = data2.id;
    localStorage.setItem('karma-faceit-' + faceitId, target_id);
  }

  // Post vote
  const match_id = window.location.pathname;
  const res3 = await fetch(`${BACKEND_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reporter_id, target_id, match_id, tag })
  });
  if (!res3.ok) {
    const errorData = await res3.json();
    throw new Error(errorData.error || 'Vote not accepted');
  }
}

function fetchScore(faceitId, nickname, cb) {
  console.log('Fetching score for Faceit ID:', faceitId);
  fetch(`${BACKEND_URL}/api/lookup/faceit/${faceitId}`)
    .then(r => {
      console.log('Lookup response status:', r.status);
      if (!r.ok) {
        if (r.status === 404) {
          console.log('User not found in database yet');
          return cb(null, null, faceitId, nickname);
        }
        throw new Error('Failed to lookup user');
      }
      return r.json();
    })
    .then(data => {
      console.log('Lookup data received:', data);
      if (data) {
        cb(data.vibeScore, data.warning, faceitId, nickname);
      } else {
        cb(null, null, faceitId, nickname);
      }
    })
    .catch(err => {
      console.error('Error fetching score:', err);
      cb(null, null, faceitId, nickname);
    });
}

function extractFaceitId() {
  // Try to extract Faceit player ID from URL
  // Faceit profile URLs are typically: https://www.faceit.com/en/players/PLAYERNAME or /players-modal/PLAYERID
  const urlParts = window.location.pathname.split('/');

  // Look for "players" in the URL path
  const playersIndex = urlParts.indexOf('players');
  if (playersIndex !== -1 && urlParts[playersIndex + 1]) {
    return urlParts[playersIndex + 1];
  }

  // Also check for players-modal
  const playersModalIndex = urlParts.indexOf('players-modal');
  if (playersModalIndex !== -1 && urlParts[playersModalIndex + 1]) {
    return urlParts[playersModalIndex + 1];
  }

  return null;
}

function extractNickname() {
  const nameElem = getPlayerNameElement();
  return nameElem ? nameElem.textContent.trim() : 'Unknown';
}

function initKarmaVibeOverlay() {
  console.log('🎯 initKarmaVibeOverlay called for Faceit');
  console.log('📍 Current pathname:', window.location.pathname);

  const faceitId = extractFaceitId();
  const nickname = extractNickname();

  console.log('✅ Found Faceit ID:', faceitId);
  console.log('✅ Found nickname:', nickname);

  if (!faceitId) {
    console.log('❌ No Faceit ID found, exiting');
    return;
  }

  console.log('🔍 Fetching score for Faceit ID:', faceitId);
  fetchScore(faceitId, nickname, injectOverlay);
}

// Try multiple initialization methods with aggressive retries
console.log('📍 Document ready state:', document.readyState);

function tryInit() {
  console.log('🚀 Attempting to initialize...');
  if (!document.getElementById('karma-vibe-root')) {
    initKarmaVibeOverlay();
  }
}

// 1. Try immediately
setTimeout(tryInit, 100);

// 2. Try after DOM loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInit);
} else {
  tryInit();
}

// 3. Try after full page load
window.addEventListener('load', tryInit);

// 4. Retry every 2 seconds for first 10 seconds (Faceit loads slowly)
let retries = 0;
const retryInterval = setInterval(() => {
  retries++;
  console.log(`🔄 Retry attempt ${retries}/5`);
  tryInit();
  if (retries >= 5) {
    clearInterval(retryInterval);
    console.log('⏹️ Stopped retrying');
  }
}, 2000);

// 5. Watch for URL changes (Faceit uses SPA routing)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('🔄 URL changed to:', currentUrl);
    setTimeout(() => {
      // Remove old badge if exists
      const oldRoot = document.getElementById('karma-vibe-root');
      if (oldRoot) oldRoot.remove();
      tryInit();
    }, 1500);
  }
}).observe(document, { subtree: true, childList: true });
