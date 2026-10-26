// public/js/gallery.js
// Loads and displays the gallery items with a full-size lightbox viewer.

let galleryItems = [];

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');

  if (!lightbox) return;

  function closeLightbox() {
    lightbox.classList.add('hidden');
    imgEl.src = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });

  window.openLightbox = function (item) {
    titleEl.textContent = item.title;
    descEl.textContent = item.description;
    imgEl.src = imageSrc(item.image);
    imgEl.alt = item.title;
    lightbox.classList.remove('hidden');
  };
}

function renderGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  if (galleryItems.length === 0) {
    container.innerHTML = '<p class="empty">No images found in the gallery.</p>';
    return;
  }

  container.innerHTML = `
    <div class="gallery-grid">
      ${galleryItems.map((item, index) => `
        <article class="card gallery-card" style="cursor: pointer;" data-index="${index}">
          <img class="card-image" src="${escapeHtml(imageSrc(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy">
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-text">${escapeHtml(item.description)}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;

  const cards = container.querySelectorAll('.gallery-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const index = Number(card.dataset.index);
      const item = galleryItems[index];
      if (item && window.openLightbox) {
        window.openLightbox(item);
      }
    });
  });
}

async function loadGallery() {
  const container = document.getElementById('gallery-container');
  setPageTitle('Gallery');
  setupLightbox();

  try {
    galleryItems = await fetchJson('/api/gallery');
    renderGallery();
  } catch (error) {
    if (container) {
      container.innerHTML = alertHtml('error', 'Could not load gallery: ' + error.message);
    }
  }
}

loadGallery();
