// routes/cars.js
// Cars: list (with optional class filter) and single car. Public.

const express = require('express');
const db = require('../database/db');

const router = express.Router();

// GET /api/cars          -> all cars
// GET /api/cars?class=GT3 -> only GT3 cars
router.get('/', (req, res) => {
  const carClass = req.query.class;

  if (carClass === undefined || carClass === '') {
    const cars = db.prepare('SELECT * FROM cars ORDER BY class, name').all();
    return res.json(cars);
  }

  if (carClass !== 'GT3' && carClass !== 'GT4') {
    return res.status(400).json({ error: 'class must be GT3 or GT4.' });
  }

  const cars = db.prepare('SELECT * FROM cars WHERE class = ? ORDER BY name').all(carClass);
  res.json(cars);
});

// GET /api/cars/3 -> one car
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid car id.' });
  }

  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found.' });
  }
  res.json(car);
});

module.exports = router;