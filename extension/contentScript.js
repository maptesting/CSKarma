// Configuration - can be changed via extension settings
const BACKEND_URL = 'https://cskarma-production.up.railway.app';

console.log('🎮 Karma extension loaded! URL:', window.location.href);

// Where to inject on Steam profile
function getPlayerNameElement() {
  return document.querySelector('.profile_header .profile_header_summary .persona_name');
}

function createBadge(score, warningText) {
  const badge = document.createElement('span');
  badge.className = 'karma-vibe-badge';
  // Use textContent instead of innerText for better security
  badge.textContent = `Vibe Score: ${score ?? '?'}/5`;
  if (warningText) {
    // Sanitize warning text to prevent XSS
    badge.textContent += ` | ${String(warningText).replace(/[<>]/g, '')}`;
    badge.style.background = '#f43f5e';
  }
  return badge;
}

function createVoteBtn(steamId) {
  const btn = document.createElement('button');
  btn.className = 'karma-vibe-badge';
  btn.style.background = '#7836ff';
  btn.innerText = 'Rate Player';
  btn.onclick = () => openVoteModal(steamId);
  return btn;
}

function injectOverlay(score, warning, steamId) {
  const nameElem = getPlayerNameElement();
  if (!nameElem) return;
  if (document.getElementById('karma-vibe-root')) return;
  const root = document.createElement('span');
  root.id = 'karma-vibe-root';
  root.appendChild(createBadge(score, warning));
  root.appendChild(createVoteBtn(steamId));
  nameElem.parentNode.appendChild(root);
}

function openVoteModal(steamId) {
  if (document.getElementById('karma-vibe-modal')) return;
  const modal = document.createElement('div');
  modal.className = 'karma-vibe-modal';
  modal.id = 'karma-vibe-modal';

  // Create modal content safely without innerHTML to prevent XSS
  const closeBtn = document.createElement('button');
  closeBtn.className = 'karma-vibe-close';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => modal.remove();

  const title = document.createElement('h3');
  title.textContent = 'How was this player\'s vibe?';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '20px';

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(buttonContainer);

  ['Helpful','Toxic','No Mic','Rager'].forEach(type => {
    const b = document.createElement('button');
    b.textContent = type;
    b.onclick = async () => {
      try {
        await sendVote(type, steamId);
        // Clear modal content safely
        modal.innerHTML = '';
        const successMsg = document.createElement('b');
        successMsg.textContent = 'Thank you for your feedback!';
        modal.appendChild(successMsg);
        setTimeout(() => modal.remove(), 1300);
      } catch (e) {
        // Clear modal content safely
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

async function sendVote(tag, targetSteamId) {
  // For MVP: try to look up/create anonymous reporter user
  let reporter_id = localStorage.getItem('karma-reporter-id');
  if (!reporter_id) {
    // Fake anonymous; in production, require auth
    const steam_id = Math.random().toString().slice(2, 12); // demo only
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
  // Look up or create target user
  let target_id = localStorage.getItem('karma-user-' + targetSteamId);
  if (!target_id) {
    const res2 = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steam_id: targetSteamId })
    });
    if (!res2.ok) throw new Error('Failed to create target user');
    const data2 = await res2.json();
    target_id = data2.id;
    localStorage.setItem('karma-user-' + targetSteamId, target_id);
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

function fetchScore(steamId, cb) {
  console.log('Fetching score for Steam ID:', steamId);
  // Use the new lookup endpoint that works for any Steam user
  fetch(`${BACKEND_URL}/api/lookup/${steamId}`)
    .then(r => {
      console.log('Lookup response status:', r.status);
      if (!r.ok) {
        if (r.status === 404) {
          console.log('User not found in Steam API');
          return cb(null, null, steamId);
        }
        throw new Error('Failed to lookup user');
      }
      return r.json();
    })
    .then(data => {
      console.log('Lookup data received:', data);
      if (data) {
        cb(data.vibeScore, data.warning, steamId);
      } else {
        cb(null, null, steamId);
      }
    })
    .catch(err => {
      console.error('Error fetching score:', err);
      cb(null, null, steamId);
    });
}

function initKarmaVibeOverlay() {
  const urlParts = window.location.pathname.split('/');
  let steamId = null;
  if (urlParts[1] === 'id' || urlParts[1] === 'profiles') steamId = urlParts[2];
  if (!steamId) return;
  fetchScore(steamId, injectOverlay);
}

window.addEventListener('DOMContentLoaded', initKarmaVibeOverlay);
