// Configuration
const BACKEND_URL = 'https://cskarma-production.up.railway.app';

console.log('🛡️ CommSafe Faceit extension loaded! URL:', window.location.href);

// Where to inject on Faceit profile - look for action buttons area
function getInjectionPoint() {
  console.log('🔍 Searching for injection point near SHARE button...');

  // Look for elements containing "SHARE" text
  const buttons = Array.from(document.querySelectorAll('button'));
  const shareButton = buttons.find(btn => btn.textContent.trim() === 'SHARE');

  if (shareButton) {
    console.log('✅ Found SHARE button:', shareButton);
    console.log('SHARE button parent:', shareButton.parentElement);

    // The buttons are likely in a flex container together
    // Try to find the parent that contains both buttons
    let parent = shareButton.parentElement;

    // Go up a few levels to find the container that holds both action buttons
    for (let i = 0; i < 3; i++) {
      if (parent) {
        console.log(`Level ${i} parent:`, parent);
        const hasGift = Array.from(parent.querySelectorAll('button')).some(btn =>
          btn.textContent.includes('GIFT')
        );
        if (hasGift) {
          console.log('✅ Found container with both SHARE and GIFT buttons');
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    // If we can't find the combined container, just use the SHARE button's immediate parent
    console.log('⚠️ Using SHARE button parent as fallback');
    return shareButton.parentElement;
  }

  // Try "Member since" text as another anchor point
  const memberSinceText = Array.from(document.querySelectorAll('*')).find(el =>
    el.textContent.includes('Member since')
  );

  if (memberSinceText) {
    console.log('✅ Found "Member since" text, using its parent');
    return memberSinceText.parentElement;
  }

  console.log('❌ Could not find injection point near buttons');
  return null;
}

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

  if (document.getElementById('karma-vibe-root')) {
    console.log('⚠️ Already injected, skipping');
    return;
  }

  const root = document.createElement('div');
  root.id = 'karma-vibe-root';
  root.style.marginTop = '12px';
  root.style.display = 'flex';
  root.style.gap = '8px';
  root.appendChild(createBadge(score, warning));
  root.appendChild(createVoteBtn(faceitId, nickname));

  // Try to inject near the SHARE/GIFT SUB buttons
  const injectionPoint = getInjectionPoint();
  console.log('📍 Injection point:', injectionPoint);

  if (injectionPoint && injectionPoint.parentNode) {
    // Insert after the button container
    injectionPoint.parentNode.insertBefore(root, injectionPoint.nextSibling);
    console.log('✅ Successfully injected vibe badge below action buttons!');
    return;
  }

  // Fallback: try player name element
  const nameElem = getPlayerNameElement();
  console.log('👤 Player name element:', nameElem);

  if (nameElem && nameElem.parentNode) {
    const container = nameElem.parentNode;
    if (container && container.parentNode) {
      container.parentNode.insertBefore(root, container.nextSibling);
      console.log('✅ Successfully injected vibe badge after name!');
      return;
    }
  }

  // Last resort: Create a floating badge in top-right corner
  console.log('⚠️ No anchor element found, using floating badge');
  root.style.position = 'fixed';
  root.style.top = '80px';
  root.style.right = '20px';
  root.style.zIndex = '10000';
  root.style.background = 'rgba(0, 0, 0, 0.9)';
  root.style.padding = '15px';
  root.style.borderRadius = '12px';
  root.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  document.body.appendChild(root);
  console.log('✅ Successfully injected floating vibe badge!');
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
  if (nameElem) {
    return nameElem.textContent.trim();
  }

  // Fallback: try to extract from page title or meta tags
  const pageTitle = document.title;
  const titleMatch = pageTitle.match(/^([^\|\-]+)/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  return 'Unknown';
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
