// server.js
// Starting point of the website: sets up Express and connects all parts.

require('dotenv').config();   // loads values from .env into process.env

const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');

require('./database/db');     // opens the database (creates it on first run)
const { requireAdminPage } = require('./middleware/auth');

// ---------- Check settings ----------
if (!process.env.SESSION_SECRET || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
  console.error('Missing settings. Copy .env.example to .env and fill in all values.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');   // do not advertise that we use Express

// Make sure the folder for uploaded images exists
fs.mkdirSync(path.join(__dirname, 'public', 'uploads'), { recursive: true });

// ---------- Middleware ----------
app.use(express.json({ limit: '1mb' }));   // lets us read JSON sent from the browser

app.use(session({
  name: 'acc.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,                 // JavaScript in the browser cannot read this cookie
    sameSite: 'lax',                // helps protect against cross-site requests
    secure: false,                  // false because we use http://localhost (use true with https)
    maxAge: 1000 * 60 * 60 * 2      // login lasts 2 hours
  }
}));

// ---------- Admin pages (must be logged in) ----------
app.get('/admin', (req, res) => res.redirect('/admin/game.html'));
app.use('/admin', requireAdminPage, express.static(path.join(__dirname, 'public', 'admin')));

// ---------- Public files (HTML, CSS, JS, images, uploads) ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API routes ----------
app.use('/api/game', require('./routes/game'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/circuits', require('./routes/circuits'));
app.use('/api/news', require('./routes/news'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/search', require('./routes/search'));
app.use('/api', require('./routes/auth'));   // /api/login, /api/logout, /api/session

// Unknown API URL -> JSON error
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// ---------- 404 page for everything else ----------
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ---------- Error handler (catches crashes and bad requests) ----------
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Something went wrong on the server.' : err.message;

  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({ error: message });
  }
  res.status(status).send(message);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});