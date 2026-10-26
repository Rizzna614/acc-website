// public/js/news-details.js
// Loads and displays the full text of a single news article.

async function loadArticle() {
  const container = document.getElementById('article-container');
  const id = getQueryParam('id');

  if (!id) {
    container.innerHTML = `
      <div class="alert alert-error">No article ID specified.</div>
      <p><a class="btn btn-secondary" href="/news.html">← Back to news</a></p>
    `;
    return;
  }

  try {
    const article = await fetchJson(`/api/news/${encodeURIComponent(id)}`);
    setPageTitle(article.title);

    container.innerHTML = `
      <nav class="breadcrumb">
        <a href="/">Home</a> / <a href="/news.html">News</a> / <span>${escapeHtml(article.title)}</span>
      </nav>

      <article class="prose" style="max-width: 800px; margin: 0 auto;">
        <div class="card-meta" style="margin-bottom: 12px;">
          <span class="badge">${escapeHtml(article.category)}</span>
          <span>Published on ${escapeHtml(formatDate(article.date))}</span>
        </div>

        <h1 style="margin-bottom: 16px;">${escapeHtml(article.title)}</h1>

        <p class="lead">${escapeHtml(article.description)}</p>

        <img class="article-image" src="${escapeHtml(imageSrc(article.image))}" alt="${escapeHtml(article.title)}">

        <div class="article-body">
          ${textToHtml(article.content)}
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <a class="btn btn-secondary" href="/news.html">← Back to all news</a>
          <a class="btn btn-secondary" href="/content.html">Explore cars &amp; circuits →</a>
        </div>
      </article>
    `;
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-error">Could not load article: ${escapeHtml(error.message)}</div>
      <p><a class="btn btn-secondary" href="/news.html">← Back to news</a></p>
    `;
  }
}

loadArticle();
