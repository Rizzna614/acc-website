// public/js/content.js
// Content page: displays GT3 and GT4 cars and racing circuits with tab filtering.

let allCars = [];
let allCircuits = [];
let currentFilter = 'all';

function renderContent() {
  const container = document.getElementById('content-container');
  if (!container) return;

  if (currentFilter === 'GT3') {
    const cars = allCars.filter((c) => c.class === 'GT3');
    container.innerHTML = `
      <div class="section-header">
        <h2>GT3 Cars (${cars.length})</h2>
      </div>
      ${cars.length > 0 ? `<div class="card-grid">${cars.map(carCardHtml).join('')}</div>` : '<p class="empty">No GT3 cars found.</p>'}
    `;
  } else if (currentFilter === 'GT4') {
    const cars = allCars.filter((c) => c.class === 'GT4');
    container.innerHTML = `
      <div class="section-header">
        <h2>GT4 Cars (${cars.length})</h2>
      </div>
      ${cars.length > 0 ? `<div class="card-grid">${cars.map(carCardHtml).join('')}</div>` : '<p class="empty">No GT4 cars found.</p>'}
    `;
  } else if (currentFilter === 'circuits') {
    container.innerHTML = `
      <div class="section-header">
        <h2>Racing Circuits (${allCircuits.length})</h2>
      </div>
      ${allCircuits.length > 0 ? `<div class="card-grid">${allCircuits.map(circuitCardHtml).join('')}</div>` : '<p class="empty">No circuits found.</p>'}
    `;
  } else {
    // "all": show both cars and circuits in structured sections
    container.innerHTML = `
      <div class="section-header">
        <h2>Race Cars (${allCars.length})</h2>
      </div>
      <div class="card-grid" style="margin-bottom: 48px;">
        ${allCars.map(carCardHtml).join('')}
      </div>

      <div class="section-header">
        <h2>Racing Circuits (${allCircuits.length})</h2>
      </div>
      <div class="card-grid">
        ${allCircuits.map(circuitCardHtml).join('')}
      </div>
    `;
  }
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('#content-tabs .tab');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderContent();
    });
  });

  // Check URL query param for default filter, e.g. /content.html?filter=GT3
  const requestedFilter = getQueryParam('filter');
  if (requestedFilter && ['all', 'GT3', 'GT4', 'circuits'].includes(requestedFilter)) {
    const matchingBtn = document.querySelector(`#content-tabs .tab[data-filter="${requestedFilter}"]`);
    if (matchingBtn) {
      tabButtons.forEach((b) => b.classList.remove('active'));
      matchingBtn.classList.add('active');
      currentFilter = requestedFilter;
    }
  }
}

async function loadContent() {
  const container = document.getElementById('content-container');
  setPageTitle('Content');

  try {
    const [cars, circuits] = await Promise.all([
      fetchJson('/api/cars'),
      fetchJson('/api/circuits')
    ]);

    allCars = cars;
    allCircuits = circuits;

    setupTabs();
    renderContent();
  } catch (error) {
    if (container) {
      container.innerHTML = alertHtml('error', 'Could not load content: ' + error.message);
    }
  }
}

loadContent();
