// public/admin/news.js
// Admin panel: CRUD operations for news articles with image uploads.

let newsArticles = [];

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function showForm(article = null) {
  const panel = document.getElementById('news-form-panel');
  const heading = document.getElementById('form-heading');
  const idInput = document.getElementById('news-id');
  const titleInput = document.getElementById('title');
  const categoryInput = document.getElementById('category');
  const dateInput = document.getElementById('date');
  const descInput = document.getElementById('description');
  const contentInput = document.getElementById('content');
  const imageInput = document.getElementById('image');
  const imageLabel = document.getElementById('image-label');
  const imageHint = document.getElementById('image-hint');
  const imagePreview = document.getElementById('image-preview');

  panel.classList.remove('hidden');
  imageInput.value = '';

  if (article) {
    heading.textContent = `Edit Article: ${article.title}`;
    idInput.value = article.id;
    titleInput.value = article.title;
    categoryInput.value = article.category;
    dateInput.value = article.date;
    descInput.value = article.description;
    contentInput.value = article.content;

    imageInput.required = false;
    imageLabel.textContent = 'Change Cover Image (optional)';
    imageHint.textContent = 'Leave empty to keep the existing image.';

    if (article.image) {
      imagePreview.src = imageSrc(article.image);
      imagePreview.classList.remove('hidden');
    } else {
      imagePreview.classList.add('hidden');
    }
  } else {
    heading.textContent = 'Add New Article';
    idInput.value = '';
    titleInput.value = '';
    categoryInput.value = '';
    dateInput.value = todayDateString();
    descInput.value = '';
    contentInput.value = '';

    imageInput.required = true;
    imageLabel.textContent = 'Cover Image *';
    imageHint.textContent = 'Allowed formats: JPG, PNG, WEBP (max 5 MB).';
    imagePreview.classList.add('hidden');
    imagePreview.src = '';
  }

  panel.scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
  const panel = document.getElementById('news-form-panel');
  panel.classList.add('hidden');
}

function renderTable() {
  const container = document.getElementById('news-table-container');
  if (!container) return;

  if (newsArticles.length === 0) {
    container.innerHTML = '<p class="empty">No news articles in the database.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th style="width: 80px;">Cover</th>
          <th>Title</th>
          <th style="width: 130px;">Category</th>
          <th style="width: 120px;">Date</th>
          <th style="width: 150px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${newsArticles.map((article) => `
          <tr>
            <td>
              <img class="thumb" src="${escapeHtml(imageSrc(article.image))}" alt="${escapeHtml(article.title)}">
            </td>
            <td>
              <strong>${escapeHtml(article.title)}</strong>
              <div class="muted" style="font-size: 0.85rem; max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(article.description)}
              </div>
            </td>
            <td><span class="badge">${escapeHtml(article.category)}</span></td>
            <td>${escapeHtml(article.date)}</td>
            <td>
              <div class="actions">
                <button class="btn btn-secondary btn-small edit-btn" data-id="${article.id}" type="button">Edit</button>
                <button class="btn btn-danger btn-small delete-btn" data-id="${article.id}" type="button">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Attach Edit listeners
  container.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const article = newsArticles.find((a) => a.id === id);
      if (article) {
        showForm(article);
      }
    });
  });

  // Attach Delete listeners
  container.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const article = newsArticles.find((a) => a.id === id);
      const title = article ? article.title : 'this article';

      if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
      }

      const alertEl = document.getElementById('admin-alert');
      try {
        await fetchJson(`/api/news/${id}`, { method: 'DELETE' });
        alertEl.innerHTML = alertHtml('success', `Article "${title}" deleted successfully.`);
        await loadArticles();
      } catch (error) {
        alertEl.innerHTML = alertHtml('error', 'Could not delete article: ' + error.message);
      }
    });
  });
}

async function loadArticles() {
  const container = document.getElementById('news-table-container');
  try {
    newsArticles = await fetchJson('/api/news');
    renderTable();
  } catch (error) {
    if (container) {
      container.innerHTML = alertHtml('error', 'Could not load news: ' + error.message);
    }
  }
}

function initNewsAdmin() {
  const openCreateBtn = document.getElementById('open-create-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const form = document.getElementById('news-form');
  const alertEl = document.getElementById('admin-alert');
  const saveBtn = document.getElementById('save-article-btn');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');

  loadArticles();

  openCreateBtn.addEventListener('click', () => {
    alertEl.innerHTML = '';
    showForm(null);
  });

  cancelBtn.addEventListener('click', () => {
    hideForm();
  });

  // Live image file preview
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

    const id = document.getElementById('news-id').value;
    const isEdit = Boolean(id);

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('category', document.getElementById('category').value.trim());
    formData.append('date', document.getElementById('date').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('content', document.getElementById('content').value.trim());

    if (imageInput.files && imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    try {
      const url = isEdit ? `/api/news/${id}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';

      await fetchJson(url, {
        method,
        body: formData
      });

      alertEl.innerHTML = alertHtml('success', isEdit ? 'Article updated successfully!' : 'Article created successfully!');
      hideForm();
      await loadArticles();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alertEl.innerHTML = alertHtml('error', 'Failed to save article: ' + error.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Article';
    }
  });
}

initNewsAdmin();
