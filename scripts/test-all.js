// scripts/test-all.js
// Automated verification script for all routes, public pages, APIs and admin auth.

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

// Spin up a test server instance using the app
// We can require server setup or run against running server.
// Let's create an in-process server with the express app
const express = require('express');
const session = require('express-session');
require('../database/db');
const { requireAdminPage } = require('../middleware/auth');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(session({
  name: 'acc.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 2 }
}));

app.get('/admin', (req, res) => res.redirect('/admin/game.html'));
app.use('/admin', requireAdminPage, express.static(path.join(__dirname, '..', 'public', 'admin')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/game', require('../routes/game'));
app.use('/api/cars', require('../routes/cars'));
app.use('/api/circuits', require('../routes/circuits'));
app.use('/api/news', require('../routes/news'));
app.use('/api/gallery', require('../routes/gallery'));
app.use('/api/search', require('../routes/search'));
app.use('/api', require('../routes/auth'));

app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

const PORT = 3999;
const server = app.listen(PORT, async () => {
  console.log(`[TEST] Verification server listening on port ${PORT}\n`);
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const headers = options.headers || {};
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path,
        method: options.method || 'GET',
        headers
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(body); } catch(e) {}
          resolve({ status: res.statusCode, headers: res.headers, body, json });
        });
      });
      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  try {
    console.log('--- 1. Testing Public HTML Pages ---');
    const rHome = await request('/');
    assert(rHome.status === 200 && rHome.body.includes('Home – ACC Fan Site'), 'Homepage (/) loads correctly');

    const rDesc = await request('/description.html');
    assert(rDesc.status === 200 && rDesc.body.includes('Description – ACC Fan Site'), 'Description page loads correctly');

    const rContent = await request('/content.html');
    assert(rContent.status === 200 && rContent.body.includes('Content – ACC Fan Site'), 'Content page loads correctly');

    const rCar = await request('/car.html?id=1');
    assert(rCar.status === 200 && rCar.body.includes('Car Details – ACC Fan Site'), 'Car details page loads correctly');

    const rCircuit = await request('/circuit.html?id=1');
    assert(rCircuit.status === 200 && rCircuit.body.includes('Circuit Details – ACC Fan Site'), 'Circuit details page loads correctly');

    const rNews = await request('/news.html');
    assert(rNews.status === 200 && rNews.body.includes('News – ACC Fan Site'), 'News page loads correctly');

    const rNewsDetails = await request('/news-details.html?id=1');
    assert(rNewsDetails.status === 200 && rNewsDetails.body.includes('Article – ACC Fan Site'), 'News details page loads correctly');

    const rGallery = await request('/gallery.html');
    assert(rGallery.status === 200 && rGallery.body.includes('Gallery – ACC Fan Site'), 'Gallery page loads correctly');

    const rSearch = await request('/search.html?q=monza');
    assert(rSearch.status === 200 && rSearch.body.includes('Search – ACC Fan Site'), 'Search results page loads correctly');

    const r404 = await request('/this-path-does-not-exist');
    assert(r404.status === 404 && r404.body.includes('404'), 'Custom 404 page returned for unknown path');

    console.log('\n--- 2. Testing Public REST APIs ---');
    const apiGame = await request('/api/game');
    assert(apiGame.status === 200 && apiGame.json.name === 'Assetto Corsa Competizione', 'GET /api/game returns game details');

    const apiCars = await request('/api/cars');
    assert(apiCars.status === 200 && Array.isArray(apiCars.json) && apiCars.json.length >= 9, 'GET /api/cars returns cars list');

    const apiCar1 = await request('/api/cars/1');
    assert(apiCar1.status === 200 && apiCar1.json.name.includes('Ferrari'), 'GET /api/cars/1 returns single car');

    const apiCircuits = await request('/api/circuits');
    assert(apiCircuits.status === 200 && Array.isArray(apiCircuits.json) && apiCircuits.json.length >= 6, 'GET /api/circuits returns circuits');

    const apiNews = await request('/api/news');
    assert(apiNews.status === 200 && Array.isArray(apiNews.json) && apiNews.json.length >= 3, 'GET /api/news returns news articles');

    const apiGallery = await request('/api/gallery');
    assert(apiGallery.status === 200 && Array.isArray(apiGallery.json) && apiGallery.json.length >= 4, 'GET /api/gallery returns gallery items');

    const apiSearch = await request('/api/search?q=monza');
    assert(apiSearch.status === 200 && apiSearch.json.count >= 1, 'GET /api/search?q=monza returns search results');

    console.log('\n--- 3. Testing Authentication & Protected Routes ---');
    const rAdminGameNoAuth = await request('/admin/game.html');
    assert(rAdminGameNoAuth.status === 302 && rAdminGameNoAuth.headers.location === '/admin/login.html', 'GET /admin/game.html redirects unauthenticated visitors to login');

    const rLoginFail = await request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'admin', password: 'wrongpassword' }
    });
    assert(rLoginFail.status === 401, 'POST /api/login rejects wrong password');

    const rLoginOk = await request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'admin', password: 'admin123' }
    });
    assert(rLoginOk.status === 200 && rLoginOk.json.ok === true, 'POST /api/login succeeds with correct password');

    const setCookie = rLoginOk.headers['set-cookie'];
    const sessionCookie = setCookie ? setCookie[0].split(';')[0] : '';
    assert(Boolean(sessionCookie), 'Server issued session cookie acc.sid');

    const rSessionCheck = await request('/api/session', {
      headers: { 'Cookie': sessionCookie }
    });
    assert(rSessionCheck.status === 200 && rSessionCheck.json.loggedIn === true, 'GET /api/session reports loggedIn: true with cookie');

    const rAdminGameAuth = await request('/admin/game.html', {
      headers: { 'Cookie': sessionCookie }
    });
    assert(rAdminGameAuth.status === 200 && rAdminGameAuth.body.includes('Edit Game Info'), 'GET /admin/game.html allows access with session');

    const rAdminNewsAuth = await request('/admin/news.html', {
      headers: { 'Cookie': sessionCookie }
    });
    assert(rAdminNewsAuth.status === 200 && rAdminNewsAuth.body.includes('Manage News'), 'GET /admin/news.html allows access with session');

    const rAdminGalleryAuth = await request('/admin/gallery.html', {
      headers: { 'Cookie': sessionCookie }
    });
    assert(rAdminGalleryAuth.status === 200 && rAdminGalleryAuth.body.includes('Manage Gallery'), 'GET /admin/gallery.html allows access with session');

    console.log('\n--- 4. Testing Admin CRUD Operations ---');
    // Test PUT /api/game
    const rGameUpdate = await request('/api/game', {
      method: 'PUT',
      headers: { 'Cookie': sessionCookie, 'Content-Type': 'application/json' },
      body: {
        name: 'Assetto Corsa Competizione',
        short_description: 'The official GT World Challenge simulation: real GT3 and GT4 cars, real circuits, serious racing.',
        developer: 'Kunos Simulazioni',
        publisher: '505 Games',
        genre: 'Racing simulation',
        release_year: 2019,
        platforms: 'PC, PlayStation 4, PlayStation 5, Xbox One, Xbox Series X|S',
        description: 'Assetto Corsa Competizione (ACC) is a racing simulation focused on GT3 and GT4 racing.'
      }
    });
    assert(rGameUpdate.status === 200 && rGameUpdate.json.name === 'Assetto Corsa Competizione', 'PUT /api/game successfully updates game information');

    // Test Logout
    const rLogout = await request('/api/logout', {
      method: 'POST',
      headers: { 'Cookie': sessionCookie }
    });
    assert(rLogout.status === 200 && rLogout.json.ok === true, 'POST /api/logout terminates session');

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
});
