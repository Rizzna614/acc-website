// public/js/utils.js
// Shared helper functions, header/footer and reusable cards.
// Loaded on every page BEFORE the page's own script.

// ---------- Safe text ----------

// Turns special characters into harmless text, so database content can never run as code.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Text with blank lines -> separate <p> paragraphs (safely escaped).
function textToHtml(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// ---------- Small helpers ----------

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// "2026-10-08" -> "8 October 2026"
function formatDate(isoDate) {
  const date = new Date(isoDate + 'T00:00:00Z');
  if (Number.isNaN(date.getTime())) {
    return String(isoDate ?? '');
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// Use a placeholder picture if an item has no image
function imageSrc(path) {
  return path ? path : '/images/placeholder.svg';
}

// type is 'error' or 'success'
function alertHtml(type, message) {
  return `<div class="alert alert-${type}" role="alert">${escapeHtml(message)}</div>`;
}

function setPageTitle(text) {
  document.title = `${text} – ACC Fan Site`;
}

function isAdminPage() {
  return window.location.pathname.startsWith('/admin/');
}

// ---------- Talking to the server ----------

// Sends a request to the API and returns the JSON answer.
// Throws an Error (with a readable message) if something goes wrong.
//   fetchJson('/api/news')
//   fetchJson('/api/game', { method: 'PUT', body: { name: '...' } })
//   fetchJson('/api/news', { method: 'POST', body: formData })
async function fetchJson(url, options = {}) {
  const settings = { credentials: 'same-origin', ...options };
  settings.headers = { ...(options.headers || {}) };

  // A plain object is sent as JSON. FormData (file uploads) is sent as it is.
  if (settings.body && !(settings.body instanceof FormData) && typeof settings.body !== 'string') {
    settings.headers['Content-Type'] = 'application/json';
    settings.body = JSON.stringify(settings.body);
  }

  let response;
  try {
    response = await fetch(url, settings);
  } catch (error) {
    throw new Error('Could not reach the server. Is it running?');
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // the answer had no JSON body
  }

  if (!response.ok) {
    // Logged out (or session expired) while using an admin page -> go to login
    if (response.status === 401 && isAdminPage() && !window.location.pathname.endsWith('/login.html')) {
      window.location.href = '/admin/login.html';
    }
    throw new Error((data && data.error) || `Request failed (status ${response.status}).`);
  }
  return data;
}

// ---------- Reusable cards ----------

function newsCardHtml(article) {
  const url = `/news-details.html?id=${Number(article.id)}`;
  return `
    <article class="card">
      <a href="${url}">
        <img class="card-image" src="${escapeHtml(imageSrc(article.image))}" alt="${escapeHtml(article.title)}" loading="lazy">
      </a>
      <div class="card-body">
        <div class="card-meta">
          <span class="badge">${escapeHtml(article.category)}</span>
          <span>${escapeHtml(formatDate(article.date))}</span>
        </div>
        <h3 class="card-title"><a href="${url}">${escapeHtml(article.title)}</a></h3>
        <p class="card-text">${escapeHtml(article.description)}</p>
      </div>
    </article>`;
}

function carCardHtml(car) {
  const url = `/car.html?id=${Number(car.id)}`;
  const classBadge = car.class === 'GT4' ? 'badge-gt4' : 'badge-gt3';
  const subtitle = car.year ? `${car.manufacturer} · ${car.year}` : car.manufacturer;
  return `
    <article class="card">
      <a href="${url}">
        <img class="card-image" src="${escapeHtml(imageSrc(car.image))}" alt="${escapeHtml(car.name)}" loading="lazy">
      </a>
      <div class="card-body">
        <div class="card-meta">
          <span class="badge ${classBadge}">${escapeHtml(car.class)}</span>
          <span>${escapeHtml(subtitle)}</span>
        </div>
        <h3 class="card-title"><a href="${url}">${escapeHtml(car.name)}</a></h3>
        <p class="card-text">${escapeHtml(car.engine || '')}</p>
      </div>
    </article>`;
}

function circuitCardHtml(circuit) {
  const url = `/circuit.html?id=${Number(circuit.id)}`;
  const facts = [];
  if (circuit.length_km) facts.push(`${circuit.length_km} km`);
  if (circuit.turns) facts.push(`${circuit.turns} turns`);
  return `
    <article class="card">
      <a href="${url}">
        <img class="card-image" src="${escapeHtml(imageSrc(circuit.image))}" alt="${escapeHtml(circuit.name)}" loading="lazy">
      </a>
      <div class="card-body">
        <div class="card-meta">
          <span class="badge">Circuit</span>
          <span>${escapeHtml(circuit.country)}</span>
        </div>
        <h3 class="card-title"><a href="${url}">${escapeHtml(circuit.name)}</a></h3>
        <p class="card-text">${escapeHtml(facts.join(' · '))}</p>
      </div>
    </article>`;
}

// ---------- Header and footer ----------

const PUBLIC_NAV = [
  { href: '/', label: 'Home', paths: ['/', '/index.html'] },
  { href: '/description.html', label: 'Description', paths: ['/description.html'] },
  { href: '/content.html', label: 'Content', paths: ['/content.html', '/car.html', '/circuit.html'] },
  { href: '/news.html', label: 'News', paths: ['/news.html', '/news-details.html'] },
  { href: '/gallery.html', label: 'Gallery', paths: ['/gallery.html'] }
];

const ADMIN_NAV = [
  { href: '/admin/game.html', label: 'Game Info', paths: ['/admin/game.html'] },
  { href: '/admin/news.html', label: 'News', paths: ['/admin/news.html'] },
  { href: '/admin/gallery.html', label: 'Gallery', paths: ['/admin/gallery.html'] }
];

function navLinksHtml(items) {
  const currentPath = window.location.pathname;
  return items
    .map((item) => {
      const active = item.paths.includes(currentPath) ? ' active' : '';
      return `<a class="nav-link${active}" href="${item.href}">${item.label}</a>`;
    })
    .join('');
}

function publicHeaderHtml() {
  // On the search page, keep the searched word in the box
  const currentSearch = window.location.pathname === '/search.html' ? getQueryParam('q') || '' : '';
  return `
    <div class="container header-inner">
      <a class="brand" href="/"><span>ACC</span> Fan Site</a>
      <nav class="main-nav" aria-label="Main navigation">${navLinksHtml(PUBLIC_NAV)}</nav>
      <form class="search-form" action="/search.html" method="get" role="search">
        <input type="search" name="q" value="${escapeHtml(currentSearch)}" placeholder="Search cars, circuits, news"
               minlength="2" maxlength="100" required aria-label="Search">
        <button class="btn btn-secondary btn-small" type="submit">Search</button>
      </form>
    </div>`;
}

function adminHeaderHtml(layout) {
  if (layout === 'admin-login') {
    return `
      <div class="container header-inner">
        <a class="brand" href="/"><span>ACC</span> Admin</a>
        <nav class="main-nav"><a class="nav-link" href="/">← Back to website</a></nav>
      </div>`;
  }
  return `
    <div class="container header-inner">
      <a class="brand" href="/admin/game.html"><span>ACC</span> Admin</a>
      <nav class="main-nav" aria-label="Admin navigation">${navLinksHtml(ADMIN_NAV)}</nav>
      <a class="nav-link" href="/" target="_blank" rel="noopener">View website</a>
      <button class="btn btn-secondary btn-small" id="logout-btn" type="button">Log out</button>
    </div>`;
}

function footerHtml(layout) {
  if (layout !== 'public') {
    return '';
  }
  return `
    <div class="container footer-inner">
      <span>© ${new Date().getFullYear()} ACC Fan Site. A fan-made school project, not affiliated with Kunos Simulazioni or 505 Games.</span>
      <a href="/admin/login.html">Admin</a>
    </div>`;
}

function renderLayout() {
  const layout = document.body.dataset.layout || 'public';
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');

  if (header) {
    header.innerHTML = layout === 'public' ? publicHeaderHtml() : adminHeaderHtml(layout);
  }
  if (footer) {
    footer.innerHTML = footerHtml(layout);
  }

  // Log out button (admin pages only)
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await fetchJson('/api/logout', { method: 'POST' });
      } catch (error) {
        // even if this fails, go to the login page
      }
      window.location.href = '/admin/login.html';
    });
  }
}

// ---------- Broken images -> placeholder ----------
// "error" events do not bubble, so we listen in the capture phase.
document.addEventListener(
  'error',
  (event) => {
    const element = event.target;
    if (element && element.tagName === 'IMG' && !element.dataset.fallbackUsed) {
      element.dataset.fallbackUsed = '1';   // avoid an endless loop if the placeholder is missing too
      element.src = '/images/placeholder.svg';
    }
  },
  true
);

renderLayout();