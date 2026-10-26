// public/js/car.js
// Loads and displays details for an individual car.

async function loadCar() {
  const container = document.getElementById('car-container');
  const id = getQueryParam('id');

  if (!id) {
    container.innerHTML = `
      <div class="alert alert-error">No car ID specified.</div>
      <p><a class="btn btn-secondary" href="/content.html">← Back to content</a></p>
    `;
    return;
  }

  try {
    const car = await fetchJson(`/api/cars/${encodeURIComponent(id)}`);
    setPageTitle(car.name);

    const classBadge = car.class === 'GT4' ? 'badge-gt4' : 'badge-gt3';

    container.innerHTML = `
      <nav class="breadcrumb">
        <a href="/">Home</a> / <a href="/content.html">Content</a> / <span>${escapeHtml(car.name)}</span>
      </nav>

      <div class="detail-layout">
        <div>
          <div class="detail-image" style="margin-bottom: 24px;">
            <img src="${escapeHtml(imageSrc(car.image))}" alt="${escapeHtml(car.name)}">
          </div>
          <div class="prose">
            <h2>Overview</h2>
            ${textToHtml(car.description)}
          </div>
        </div>

        <aside class="panel">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h1 style="font-size: 1.5rem; margin: 0;">${escapeHtml(car.name)}</h1>
            <span class="badge ${classBadge}">${escapeHtml(car.class)}</span>
          </div>
          <p class="muted" style="margin-bottom: 20px;">${escapeHtml(car.manufacturer)}</p>

          <h3>Technical Specifications</h3>
          <dl class="spec-list">
            <dt>Class</dt>
            <dd><span class="badge ${classBadge}">${escapeHtml(car.class)}</span></dd>

            <dt>Manufacturer</dt>
            <dd>${escapeHtml(car.manufacturer)}</dd>

            <dt>Year</dt>
            <dd>${escapeHtml(car.year || 'N/A')}</dd>

            <dt>Engine</dt>
            <dd>${escapeHtml(car.engine || 'N/A')}</dd>

            <dt>Power</dt>
            <dd>${car.power_hp ? escapeHtml(car.power_hp) + ' hp' : 'N/A'}</dd>

            <dt>Weight</dt>
            <dd>${car.weight_kg ? escapeHtml(car.weight_kg) + ' kg' : 'N/A'}</dd>
          </dl>

          <div style="margin-top: 24px;">
            <a class="btn btn-secondary" href="/content.html">← Back to content</a>
          </div>
        </aside>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-error">Could not load car: ${escapeHtml(error.message)}</div>
      <p><a class="btn btn-secondary" href="/content.html">← Back to content</a></p>
    `;
  }
}

loadCar();
