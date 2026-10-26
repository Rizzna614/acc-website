// public/admin/login.js
// Handles administrator login and session redirection.

async function checkExistingSession() {
  try {
    const session = await fetchJson('/api/session');
    if (session && session.loggedIn) {
      window.location.href = '/admin/game.html';
    }
  } catch (e) {
    // Session check error can be ignored
  }
}

function initLogin() {
  const form = document.getElementById('login-form');
  const alertEl = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-btn');

  checkExistingSession();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      await fetchJson('/api/login', {
        method: 'POST',
        body: { username, password }
      });

      // On successful login, navigate to the admin dashboard
      window.location.href = '/admin/game.html';
    } catch (error) {
      alertEl.innerHTML = alertHtml('error', error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }
  });
}

initLogin();
