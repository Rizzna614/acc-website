// public/admin/gallery.js
// Admin panel: CRUD operations for gallery items with image upload.

let galleryItems = [];

function showForm(item = null) {
  const panel = document.getElementById('gallery-form-panel');
  const heading = document.getElementById('form-heading');
  const idInput = document.getElementById('gallery-id');
  const titleInput = document.getElementById('title');
  const descInput = document.getElementById('description');
  const imageInput = document.getElementById('image');
  const imageLabel = document.getElementById('image-label');
  const imageHint = document.getElementById('image-hint');
  const imagePreview = document.getElementById('image-preview');

  panel.classList.remove('hidden');
  imageInput.value = '';

  if (item) {
    heading.textContent = `Edit Image: ${item.title}`;
    idInput.value = item.id;
    titleInput.value = item.title;
    descInput.value = item.description;

    imageInput.required = false;
    imageLabel.textContent = 'Replace Image File (optional)';
    imageHint.textContent = 'Leave empty to keep the existing image.';

    if (item.image) {
      imagePreview.src = imageSrc(item.image);
      imagePreview.classList.remove('hidden');
    } else {
      imagePreview.classList.add('hidden');
    }
  } else {
    heading.textContent = 'Add Gallery Image';
    idInput.value = '';
    titleInput.value = '';
    descInput.value = '';

    imageInput.required = true;
    imageLabel.textContent = 'Image File *';
    imageHint.textContent = 'Allowed formats: JPG, PNG, WEBP (max 5 MB).';
    imagePreview.classList.add('hidden');
    imagePreview.src = '';
  }

  panel.scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
  const panel = document.getElementById('gallery-form-panel');
  panel.classList.add('hidden');
}

function renderTable() {
  const container = document.getElementById('gallery-table-container');
  if (!container) return;

  if (galleryItems.length === 0) {
    container.innerHTML = '<p class="empty">No images currently in the gallery.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th style="width: 80px;">Thumbnail</th>
          <th style="width: 200px;">Title</th>
          <th>Description</th>
          <th style="width: 150px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${galleryItems.map((item) => `
          <tr>
            <td>
              <img class="thumb" src="${escapeHtml(imageSrc(item.image))}" alt="${escapeHtml(item.title)}">
            </td>
            <td><strong>${escapeHtml(item.title)}</strong></td>
            <td><p class="muted" style="margin: 0; font-size: 0.95rem;">${escapeHtml(item.description)}</p></td>
            <td>
              <div class="actions">
                <button class="btn btn-secondary btn-small edit-btn" data-id="${item.id}" type="button">Edit</button>
                <button class="btn btn-danger btn-small delete-btn" data-id="${item.id}" type="button">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Attach Edit handlers
  container.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = galleryItems.find((g) => g.id === id);
      if (item) {
        showForm(item);
      }
    });
  });

  // Attach Delete handlers
  container.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const item = galleryItems.find((g) => g.id === id);
      const title = item ? item.title : 'this image';

      if (!confirm(`Are you sure you want to delete "${title}" from the gallery?`)) {
        return;
      }

      const alertEl = document.getElementById('admin-alert');
      try {
        await fetchJson(`/api/gallery/${id}`, { method: 'DELETE' });
        alertEl.innerHTML = alertHtml('success', `Image "${title}" deleted successfully.`);
        await loadGalleryItems();
      } catch (error) {
        alertEl.innerHTML = alertHtml('error', 'Could not delete item: ' + error.message);
      }
    });
  });
}

async function loadGalleryItems() {
  const container = document.getElementById('gallery-table-container');
  try {
    galleryItems = await fetchJson('/api/gallery');
    renderTable();
  } catch (error) {
    if (container) {
      container.innerHTML = alertHtml('error', 'Could not load gallery: ' + error.message);
    }
  }
}

function initGalleryAdmin() {
  const openCreateBtn = document.getElementById('open-create-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const form = document.getElementById('gallery-form');
  const alertEl = document.getElementById('admin-alert');
  const saveBtn = document.getElementById('save-gallery-btn');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');

  loadGalleryItems();

  openCreateBtn.addEventListener('click', () => {
    alertEl.innerHTML = '';
    showForm(null);
  });

  cancelBtn.addEventListener('click', () => {
    hideForm();
  });

  // Live preview for selected image
  imageInput.addEventListener('change', () => {
    const file = imageInput.files && imageInput.files[0];
    if (file) {
      imagePreview.src = URL.createObjectURL(file);
      imagePreview.classList.remove('hidden');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.innerHTML = '';
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const id = document.getElementById('gallery-id').value;
    const isEdit = Boolean(id);

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('description', document.getElementById('description').value.trim());

    if (imageInput.files && imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    try {
      const url = isEdit ? `/api/gallery/${id}` : '/api/gallery';
      const method = isEdit ? 'PUT' : 'POST';

      await fetchJson(url, {
        method,
        body: formData
      });

      alertEl.innerHTML = alertHtml('success', isEdit ? 'Gallery item updated successfully!' : 'Gallery item added successfully!');
      hideForm();
      await loadGalleryItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alertEl.innerHTML = alertHtml('error', 'Failed to save gallery item: ' + error.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Image';
    }
  });
}

initGalleryAdmin();
