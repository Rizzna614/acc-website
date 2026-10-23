// routes/news.js
// News: public read, admin create / update / delete.

const express = require('express');
const db = require('../database/db');
const { requireAdmin } = require('../middleware/auth');
const { uploadImage, discardUpload, deleteUploadedImage } = require('../middleware/upload');

const router = express.Router();

// ----- Helpers -----

// Returns a whole number >= 1, or null if the value is not valid
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

// Is this a real date written as YYYY-MM-DD ?
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Checks the text fields. Returns { errors: [...], clean: {...} }
function validateNews(body) {
  const errors = [];
  const clean = {};
  const rules = { category: 50, title: 150, description: 300, content: 20000 };

  for (const [field, maxLength] of Object.entries(rules)) {
    const value = typeof body[field] === 'string' ? body[field].trim() : '';
    if (!value) {
      errors.push(`${field} is required.`);
    } else if (value.length > maxLength) {
      errors.push(`${field} must be at most ${maxLength} characters.`);
    }
    clean[field] = value;
  }

  const date = typeof body.date === 'string' ? body.date.trim() : '';
  if (!isValidDate(date)) {
    errors.push('date must be a real date in the format YYYY-MM-DD.');
  }
  clean.date = date;

  return { errors, clean };
}

// ----- Public routes -----

// GET /api/news          -> all articles, newest first
// GET /api/news?limit=3  -> only the newest 3
router.get('/', (req, res) => {
  let sql = 'SELECT * FROM news ORDER BY date DESC, id DESC';
  const params = [];

  if (req.query.limit !== undefined) {
    const limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'limit must be a whole number from 1 to 50.' });
    }
    sql += ' LIMIT ?';
    params.push(limit);
  }

  res.json(db.prepare(sql).all(...params));
});

// GET /api/news/2 -> one article
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid news id.' });
  }
  const article = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  if (!article) {
    return res.status(404).json({ error: 'News article not found.' });
  }
  res.json(article);
});

// ----- Admin routes -----

// POST /api/news  (form data with fields + an "image" file)
router.post('/', requireAdmin, uploadImage, (req, res) => {
  const { errors, clean } = validateNews(req.body || {});
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
      INSERT INTO news (category, title, description, content, image, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(clean.category, clean.title, clean.description, clean.content, image, clean.date);

    const created = db.prepare('SELECT * FROM news WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    discardUpload(req);
    throw err;
  }
});

// PUT /api/news/2  (a new "image" file is optional)
router.put('/:id', requireAdmin, uploadImage, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    discardUpload(req);
    return res.status(400).json({ error: 'Invalid news id.' });
  }

  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  if (!existing) {
    discardUpload(req);
    return res.status(404).json({ error: 'News article not found.' });
  }

  const { errors, clean } = validateNews(req.body || {});
  if (errors.length > 0) {
    discardUpload(req);
    return res.status(400).json({ error: errors.join(' '), errors });
  }

  try {
    const image = req.file ? '/uploads/' + req.file.filename : existing.image;
    db.prepare(`
      UPDATE news
      SET category = ?, title = ?, description = ?, content = ?, image = ?, date = ?
      WHERE id = ?
    `).run(clean.category, clean.title, clean.description, clean.content, image, clean.date, id);

    if (req.file) {
      deleteUploadedImage(existing.image);   // remove the old uploaded image
    }

    const updated = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    discardUpload(req);
    throw err;
  }
});

// DELETE /api/news/2
router.delete('/:id', requireAdmin, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid news id.' });
  }

  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'News article not found.' });
  }

  db.prepare('DELETE FROM news WHERE id = ?').run(id);
  deleteUploadedImage(existing.image);
  res.json({ ok: true });
});

module.exports = router;