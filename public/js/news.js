// public/js/news.js
// Loads and displays all news articles with optional category filtering.

let allArticles = [];
let currentCategory = 'all';

function renderNews() {
  const container = document.getElementById('news-list-container');
  if (!container) return;

  const filtered = currentCategory === 'all'
    ? allArticles
    : allArticles.filter((a) => a.category.toLowerCase() === currentCategory.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty">No news articles found in this category.</p>';
    return;
  }

  container.innerHTML = `<div class="card-grid">${filtered.map(newsCardHtml).join('')}</div>`;
}

function setupCategoryTabs() {
  const tabsContainer = document.getElementById('news-category-tabs');
  if (!tabsContainer || allArticles.length === 0) return;

  const categories = Array.from(new Set(allArticles.map((a) => a.category).filter(Boolean)));
  if (categories.length <= 1) return; // No need for filter tabs if only 1 category

  tabsContainer.style.display = 'flex';
  tabsContainer.innerHTML = `
    <button class="tab active" data-category="all" type="button">All (${allArticles.length})</button>
    ${categories.map((cat) => {
      const count = allArticles.filter((a) => a.category === cat).length;
      return `<button class="tab" data-category="${escapeHtml(cat)}" type="button">${escapeHtml(cat)} (${count})</button>`;
    }).join('')}
  `;

  const tabs = tabsContainer.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderNews();
    });
  });
}

async function loadNews() {
  const container = document.getElementById('news-list-container');
  setPageTitle('News');

  try {
    allArticles = await fetchJson('/api/news');

    if (allArticles.length === 0) {
      container.innerHTML = '<p class="empty">No news articles published yet.</p>';
      return;
    }

    setupCategoryTabs();
    renderNews();
  } catch (error) {
    if (container) {
      container.innerHTML = alertHtml('error', 'Could not load news: ' + error.message);
    }
  }
}

loadNews();
