// routes/game.js
// Game information: read (public) and update (admin only).

const express = require('express');
const db = require('../database/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/game -> returns the one game_info row
router.get('/', (req, res) => {
  const game = db.prepare('SELECT * FROM game_info WHERE id = 1').get();
  if (!game) {
    return res.status(404).json({ error: 'Game information not found.' });
  }
  res.json(game);
});

// PUT /api/game -> saves changes (admin only)
router.put('/', requireAdmin, (req, res) => {
  const body = req.body || {};

  // Text fields and their maximum lengths
  const textFields = {
    name: 100,
    short_description: 300,
    developer: 100,
    publisher: 100,
    genre: 100,
    platforms: 200,
    description: 5000
  };

  const errors = [];
  const clean = {};

  for (const [field, maxLength] of Object.entries(textFields)) {
    const value = typeof body[field] === 'string' ? body[field].trim() : '';
    const label = field.replace(/_/g, ' ');
    if (!value) {
      errors.push(`${label} is required.`);
    } else if (value.length > maxLength) {
      errors.push(`${label} must be at most ${maxLength} characters.`);
    }
    clean[field] = value;
  }

  const year = Number(body.release_year);
  if (!Number.isInteger(year) || year < 1980 || year > 2100) {
    errors.push('release year must be a whole year between 1980 and 2100.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' '), errors });
  }

  db.prepare(`
    UPDATE game_info
    SET name = ?, short_description = ?, developer = ?, publisher = ?,
        genre = ?, release_year = ?, platforms = ?, description = ?
    WHERE id = 1
  `).run(
    clean.name, clean.short_description, clean.developer, clean.publisher,
    clean.genre, year, clean.platforms, clean.description
  );

  const updated = db.prepare('SELECT * FROM game_info WHERE id = 1').get();
  res.json(updated);
});

module.exports = router;