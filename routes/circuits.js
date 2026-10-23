// routes/circuits.js
// Circuits: list and single circuit. Public.

const express = require('express');
const db = require('../database/db');

const router = express.Router();

// GET /api/circuits -> all circuits
router.get('/', (req, res) => {
  const circuits = db.prepare('SELECT * FROM circuits ORDER BY name').all();
  res.json(circuits);
});

// GET /api/circuits/2 -> one circuit
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid circuit id.' });
  }

  const circuit = db.prepare('SELECT * FROM circuits WHERE id = ?').get(id);
  if (!circuit) {
    return res.status(404).json({ error: 'Circuit not found.' });
  }
  res.json(circuit);
});

module.exports = router;