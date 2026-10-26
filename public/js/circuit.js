// public/js/circuit.js
// Loads and displays details for an individual racing circuit.

async function loadCircuit() {
  const container = document.getElementById('circuit-container');
  const id = getQueryParam('id');

  if (!id) {
    container.innerHTML = `
      <div class="alert alert-error">No circuit ID specified.</div>
      <p><a class="btn btn-secondary" href="/content.html">← Back to content</a></p>
    `;
    return;
  }

  try {
    const circuit = await fetchJson(`/api/circuits/${encodeURIComponent(id)}`);
    setPageTitle(circuit.name);

    container.innerHTML = `
      <nav class="breadcrumb">
        <a href="/">Home</a> / <a href="/content.html">Content</a> / <span>${escapeHtml(circuit.name)}</span>
      </nav>

      <div class="detail-layout">
        <div>
          <div class="detail-image" style="margin-bottom: 24px;">
            <img src="${escapeHtml(imageSrc(circuit.image))}" alt="${escapeHtml(circuit.name)}">
          </div>
          <div class="prose">
            <h2>Circuit Overview</h2>
            ${textToHtml(circuit.description)}
          </div>
        </div>

        <aside class="panel">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h1 style="font-size: 1.5rem; margin: 0;">${escapeHtml(circuit.name)}</h1>
            <span class="badge">Circuit</span>
          </div>
          <p class="muted" style="margin-bottom: 20px;">${escapeHtml(circuit.country)}</p>

          <h3>Track Facts</h3>
          <dl class="spec-list">
            <dt>Country</dt>
            <dd>${escapeHtml(circuit.country)}</dd>

            <dt>Track Length</dt>
            <dd>${circuit.length_km ? escapeHtml(circuit.length_km) + ' km' : 'N/A'}</dd>

            <dt>Corners / Turns</dt>
            <dd>${circuit.turns ? escapeHtml(circuit.turns) + ' turns' : 'N/A'}</dd>
          </dl>

          <div style="margin-top: 24px;">
            <a class="btn btn-secondary" href="/content.html">← Back to content</a>
          </div>
        </aside>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-error">Could not load circuit: ${escapeHtml(error.message)}</div>
      <p><a class="btn btn-secondary" href="/content.html">← Back to content</a></p>
    `;
  }
}

loadCircuit();
