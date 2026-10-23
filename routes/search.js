// routes/search.js
// Search cars, circuits and news. Public.

const express = require('express');
const db = require('../database/db');

const router = express.Router();

// GET /api/search?q=monza
router.get('/', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (q.length < 2) {
    return res.status(400).json({ error: 'Please type at least 2 characters to search.' });
  }
  if (q.length > 100) {
    return res.status(400).json({ error: 'Search text is too long (maximum 100 characters).' });
  }

  // Escape the special LIKE characters (% and _) so they are treated as normal text.
  // "\" is the escape character, declared with ESCAPE '\' in the SQL below.
  const like = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';

  // ----- Cars -----
  const cars = db.prepare(`
    SELECT id, name, manufacturer, class, description, image
    FROM cars
    WHERE name LIKE ? ESCAPE '\\'
       OR manufacturer LIKE ? ESCAPE '\\'
       OR class LIKE ? ESCAPE '\\'
       OR description LIKE ? ESCAPE '\\'
    ORDER BY name
    LIMIT 50
  `).all(like, like, like, like);

  // ----- Circuits -----
  const circuits = db.prepare(`
    SELECT id, name, country, description, image
    FROM circuits
    WHERE name LIKE ? ESCAPE '\\'
       OR country LIKE ? ESCAPE '\\'
       OR description LIKE ? ESCAPE '\\'
    ORDER BY name
    LIMIT 50
  `).all(like, like, like);

  // ----- News -----
  const news = db.prepare(`
    SELECT id, category, title, description, image, date
    FROM news
    WHERE title LIKE ? ESCAPE '\\'
       OR category LIKE ? ESCAPE '\\'
       OR description LIKE ? ESCAPE '\\'
       OR content LIKE ? ESCAPE '\\'
    ORDER BY date DESC
    LIMIT 50
  `).all(like, like, like, like);

  // Turn each database row into the same simple shape
  const results = [
    ...cars.map((c) => ({
      type: 'car',
      id: c.id,
      title: c.name,
      subtitle: `${c.manufacturer} · ${c.class}`,
      description: c.description,
      image: c.image,
      url: `/car.html?id=${c.id}`
    })),
    ...circuits.map((c) => ({
      type: 'circuit',
      id: c.id,
      title: c.name,
      subtitle: c.country,
      description: c.description,
      image: c.image,
      url: `/circuit.html?id=${c.id}`
    })),
    ...news.map((n) => ({
      type: 'news',
      id: n.id,
      title: n.title,
      subtitle: `${n.category} · ${n.date}`,
      description: n.description,
      image: n.image,
      url: `/news-details.html?id=${n.id}`
    }))
  ];

  res.json({ query: q, count: results.length, results });
});

module.exports = router;