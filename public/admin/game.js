// public/admin/game.js
// Admin panel: loads and updates game information in SQLite.

let currentGameData = null;

async function loadGameData() {
  const alertEl = document.getElementById('form-alert');

  try {
    const data = await fetchJson('/api/game');
    currentGameData = data;
    populateForm(data);
  } catch (error) {
    if (alertEl) {
      alertEl.innerHTML = alertHtml('error', 'Could not load game information: ' + error.message);
    }
  }
}

function populateForm(data) {
  document.getElementById('name').value = data.name || '';
  document.getElementById('genre').value = data.genre || '';
  document.getElementById('developer').value = data.developer || '';
  document.getElementById('publisher').value = data.publisher || '';
  document.getElementById('release_year').value = data.release_year || '';
  document.getElementById('platforms').value = data.platforms || '';
  document.getElementById('short_description').value = data.short_description || '';
  document.getElementById('description').value = data.description || '';
}

function initGameAdmin() {
  const form = document.getElementById('game-form');
  const alertEl = document.getElementById('form-alert');
  const saveBtn = document.getElementById('save-btn');
  const reloadBtn = document.getElementById('reload-btn');

  loadGameData();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.innerHTML = '';
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const payload = {
      name: document.getElementById('name').value.trim(),
      genre: document.getElementById('genre').value.trim(),
      developer: document.getElementById('developer').value.trim(),
      publisher: document.getElementById('publisher').value.trim(),
      release_year: Number(document.getElementById('release_year').value),
      platforms: document.getElementById('platforms').value.trim(),
      short_description: document.getElementById('short_description').value.trim(),
      description: document.getElementById('description').value.trim()
    };

    try {
      const updated = await fetchJson('/api/game', {
        method: 'PUT',
        body: payload
      });

      currentGameData = updated;
      populateForm(updated);
      alertEl.innerHTML = alertHtml('success', 'Game information updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alertEl.innerHTML = alertHtml('error', 'Failed to save changes: ' + error.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });

  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      if (currentGameData) {
        populateForm(currentGameData);
        alertEl.innerHTML = alertHtml('success', 'Form reset to saved values.');
      }
    });
  }
}

initGameAdmin();
