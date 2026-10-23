// routes/auth.js
// Admin login, logout and session check. Mounted at /api.

const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

// ----- Very simple protection against password guessing -----
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_WINDOW_MS = 15 * 60 * 1000;   // 15 minutes
const failedAttempts = new Map();          // ip address -> { count, firstAt }

function isBlocked(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > BLOCK_WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailure(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAt > BLOCK_WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

// POST /api/login   body: { username, password }
router.post('/login', async (req, res, next) => {
  const ip = req.ip;

  if (isBlocked(ip)) {
    return res.status(429).json({ error: 'Too many failed attempts. Please try again in 15 minutes.' });
  }

  const body = req.body || {};
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter a username and a password.' });
  }
  if (username.length > 100 || password.length > 200) {
    return res.status(400).json({ error: 'Username or password is too long.' });
  }

  // Always check the password, even if the username is wrong (same response time)
  const usernameOk = username === process.env.ADMIN_USERNAME;
  const passwordOk = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

  if (!usernameOk || !passwordOk) {
    recordFailure(ip);
    return res.status(401).json({ error: 'Wrong username or password.' });
  }

  failedAttempts.delete(ip);

  // Start a fresh session (new session ID) and mark it as admin
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.isAdmin = true;
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr);
      res.json({ ok: true });
    });
  });
});

// POST /api/logout
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('acc.sid');
    res.json({ ok: true });
  });
});

// GET /api/session -> { loggedIn: true/false }
router.get('/session', (req, res) => {
  res.json({ loggedIn: Boolean(req.session && req.session.isAdmin) });
});

module.exports = router;