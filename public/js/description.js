// public/js/description.js
// Description page: all data comes from the server.

async function loadDescription() {
  const container = document.getElementById('description-content');

  try {
    const game = await fetchJson('/api/game');
    setPageTitle('Description');

    container.innerHTML = `
      <div class="two-col">
        <div class="prose">
          <h2>${escapeHtml(game.name)}</h2>
          ${textToHtml(game.description)}
        </div>
        <aside class="panel">
          <h3>Game facts</h3>
          <dl class="spec-list">
            <dt>Developer</dt><dd>${escapeHtml(game.developer)}</dd>
            <dt>Publisher</dt><dd>${escapeHtml(game.publisher)}</dd>
            <dt>Genre</dt><dd>${escapeHtml(game.genre)}</dd>
            <dt>Release year</dt><dd>${escapeHtml(game.release_year)}</dd>
            <dt>Platforms</dt><dd>${escapeHtml(game.platforms)}</dd>
          </dl>
        </aside>
      </div>`;
  } catch (error) {
    container.innerHTML = alertHtml('error', 'Could not load game information: ' + error.message);
  }
}

loadDescription();