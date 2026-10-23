// routes/gallery.js
// Gallery: public read, admin create / update / delete.

const express = require('express');
const db = require('../database/db');
const { requireAdmin } = require('../middleware/auth');
const { uploadImage, discardUpload, deleteUploadedImage } = require('../middleware/upload');

const router = express.Router();

// ----- Helpers -----

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

function validateGallery(body) {
  const errors = [];
  const clean = {};
  const rules = { title: 100, description: 500 };

  for (const [field, maxLength] of Object.entries(rules)) {
    const value = typeof body[field] === 'string' ? body[field].trim() : '';
    if (!value) {
      errors.push(`${field} is required.`);
    } else if (value.length > maxLength) {
      errors.push(`${field} must be at most ${maxLength} characters.`);
    }
    clean[field] = value;
  }

  return { errors, clean };
}

// ----- Public routes -----

// GET /api/gallery -> all items, newest first
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  res.json(items);
});

// GET /api/gallery/2 -> one item
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid gallery id.' });
  }
  const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }
  res.json(item);
});

// ----- Admin routes -----

// POST /api/gallery  (form data: title, description, image file)
router.post('/', requireAdmin, uploadImage, (req, res) => {
  const { errors, clean } = validateGallery(req.body || {});
  if (!req.file) {
    errors.push('image is required.');
  }
  if (errors.length > 0) {
    discardUpload(req);
    return res.status(400).json({ error: errors.join(' '), errors });
  }

  try {
    const image = '/uploads/' + req.file.filename;
    const result = db.prepare(`
      INSERT INTO gallery (title, description, image) VALUES (?, ?, ?)
    `).run(clean.title, clean.description, image);

    const created = db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    discardUpload(req);
    throw err;
  }
});

// PUT /api/gallery/2  (a new "image" file is optional)
router.put('/:id', requireAdmin, uploadImage, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    discardUpload(req);
    return res.status(400).json({ error: 'Invalid gallery id.' });
  }

  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  if (!existing) {
    discardUpload(req);
    return res.status(404).json({ error: 'Gallery item not found.' });
  }

  const { errors, clean } = validateGallery(req.body || {});
  if (errors.length > 0) {
    discardUpload(req);
    return res.status(400).json({ error: errors.join(' '), errors });
  }

  try {
    const image = req.file ? '/uploads/' + req.file.filename : existing.image;
    db.prepare(`
      UPDATE gallery SET title = ?, description = ?, image = ? WHERE id = ?
    `).run(clean.title, clean.description, image, id);

    if (req.file) {
      deleteUploadedImage(existing.image);
    }

    const updated = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    discardUpload(req);
    throw err;
  }
});

// DELETE /api/gallery/2
router.delete('/:id', requireAdmin, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid gallery id.' });
  }

  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }

  db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
  deleteUploadedImage(existing.image);
  res.json({ ok: true });
});

module.exports = router;