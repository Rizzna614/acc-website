// public/js/home.js
// Homepage: loads the game info and the latest news from the server.

function featuredNewsHtml(article) {
  const url = `/news-details.html?id=${Number(article.id)}`;
  return `
    <article class="featured">
      <a class="featured-image" href="${url}">
        <img src="${escapeHtml(imageSrc(article.image))}" alt="${escapeHtml(article.title)}">
      </a>
      <div class="featured-body">
        <div class="card-meta">
          <span class="badge">${escapeHtml(article.category)}</span>
          <span>${escapeHtml(formatDate(article.date))}</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p class="muted">${escapeHtml(article.description)}</p>
        <a class="btn btn-primary" href="${url}">Read article</a>
      </div>
    </article>`;
}

async function loadHome() {
  const titleEl = document.getElementById('game-title');
  const summaryEl = document.getElementById('game-summary');
  const newsEl = document.getElementById('news-content');

  // Ask for both things at the same time
  const [gameResult, newsResult] = await Promise.allSettled([
    fetchJson('/api/game'),
    fetchJson('/api/news?limit=3')
  ]);

  // ----- Game information -----
  if (gameResult.status === 'fulfilled') {
    const game = gameResult.value;
    titleEl.textContent = game.name;
    summaryEl.textContent = game.short_description;
    setPageTitle(game.name);
  } else {
    titleEl.textContent = 'Assetto Corsa Competizione';
    summaryEl.innerHTML = alertHtml('error', 'Could not load game information: ' + gameResult.reason.message);
  }

  // ----- Latest news -----
  if (newsResult.status === 'fulfilled') {
    const articles = newsResult.value;
    if (articles.length === 0) {
      newsEl.innerHTML = '<p class="empty">No news yet. Check back soon!</p>';
    } else {
      const [featured, ...others] = articles;
      newsEl.innerHTML =
        featuredNewsHtml(featured) +
        (others.length > 0 ? `<div class="card-grid">${others.map(newsCardHtml).join('')}</div>` : '');
    }
  } else {
    newsEl.innerHTML = alertHtml('error', 'Could not load news: ' + newsResult.reason.message);
  }
}

loadHome();