// public/js/search.js
// Searches cars, circuits and news via the API and displays matching cards.

function typeBadge(type) {
  if (type === 'car') return '<span class="badge badge-gt3">Car</span>';
  if (type === 'circuit') return '<span class="badge">Circuit</span>';
  if (type === 'news') return '<span class="badge">News</span>';
  return `<span class="badge">${escapeHtml(type)}</span>`;
}

async function performSearch(query) {
  const container = document.getElementById('search-results-container');
  const summary = document.getElementById('search-summary');
  const pageInput = document.getElementById('page-search-input');

  const cleanQuery = typeof query === 'string' ? query.trim() : '';

  if (pageInput) {
    pageInput.value = cleanQuery;
  }

  if (!cleanQuery) {
    if (summary) summary.textContent = 'Search across cars, circuits, and news.';
    if (container) container.innerHTML = '<p class="muted">Type a keyword into the search bar above to begin.</p>';
    setPageTitle('Search');
    return;
  }

  if (cleanQuery.length < 2) {
    if (summary) summary.textContent = 'Search query too short.';
    if (container) container.innerHTML = alertHtml('error', 'Please enter at least 2 characters to search.');
    setPageTitle(`Search: "${cleanQuery}"`);
    return;
  }

  setPageTitle(`Search: "${cleanQuery}"`);
  if (container) container.innerHTML = '<p class="loading">Searching…</p>';

  try {
    const data = await fetchJson(`/api/search?q=${encodeURIComponent(cleanQuery)}`);

    if (summary) {
      summary.textContent = `Found ${data.count} result${data.count === 1 ? '' : 's'} for "${data.query}".`;
    }

    if (data.count === 0) {
      container.innerHTML = `
        <p class="empty">No matching cars, circuits, or news articles found for <strong>"${escapeHtml(data.query)}"</strong>.</p>
        <p class="muted">Suggestions:</p>
        <ul class="muted" style="padding-left: 20px;">
          <li>Check your spelling.</li>
          <li>Try broader keywords like "Ferrari", "Porsche", "Monza", or "GT3".</li>
          <li>Browse the <a href="/content.html">Content section</a> to view all cars and tracks.</li>
        </ul>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card-grid">
        ${data.results.map((item) => `
          <article class="card">
            <a href="${escapeHtml(item.url)}">
              <img class="card-image" src="${escapeHtml(imageSrc(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy">
            </a>
            <div class="card-body">
              <div class="card-meta">
                ${typeBadge(item.type)}
                <span>${escapeHtml(item.subtitle)}</span>
              </div>
              <h3 class="card-title"><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
              <p class="card-text">${escapeHtml(item.description)}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  } catch (error) {
    if (summary) summary.textContent = 'Search failed.';
    if (container) container.innerHTML = alertHtml('error', 'Search error: ' + error.message);
  }
}

function initSearchPage() {
  const form = document.getElementById('page-search-form');
  const input = document.getElementById('page-search-input');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val.length >= 2) {
        // Update URL query string without reloading page
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('q', val);
        window.history.pushState({}, '', newUrl);
        performSearch(val);
      }
    });
  }

  const initialQuery = getQueryParam('q') || '';
  performSearch(initialQuery);
}

initSearchPage();
