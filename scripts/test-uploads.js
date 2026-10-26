// scripts/test-uploads.js
// Automated verification for multipart image uploads in news and gallery.

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
require('../database/db');

const app = express();
app.use(express.json());
app.use(session({
  name: 'acc.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 2 }
}));

app.use('/api/news', require('../routes/news'));
app.use('/api/gallery', require('../routes/gallery'));
app.use('/api', require('../routes/auth'));

const PORT = 4001;
const server = app.listen(PORT, async () => {
  console.log(`[TEST] Upload verification server on port ${PORT}`);

  // Create a minimal valid 1x1 PNG buffer
  const png1x1 = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360606060000000050001a7df85440000000049454e44ae426082',
    'hex'
  );

  function makeMultipartBody(fields, fileField, filename, fileBuffer, boundary) {
    const parts = [];
    for (const [key, val] of Object.entries(fields)) {
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
        `${val}\r\n`
      );
    }
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fileField}"; filename="${filename}"\r\n` +
      `Content-Type: image/png\r\n\r\n`
    );

    const head = Buffer.from(parts.join(''));
    const foot = Buffer.from(`\r\n--${boundary}--\r\n`);
    return Buffer.concat([head, fileBuffer, foot]);
  }

  async function rawRequest(path, method, headers, body) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers
      }, (res) => {
        let resBody = '';
        res.on('data', c => resBody += c);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(resBody); } catch(e) {}
          resolve({ status: res.statusCode, headers: res.headers, body: resBody, json });
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }

  try {
    // 1. Log in
    const loginRes = await rawRequest('/api/login', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({
      username: 'admin',
      password: 'admin123'
    }));
    const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log('  ✓ Admin logged in, cookie acquired');

    // 2. Test News Create with image upload
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const newsBody = makeMultipartBody({
      title: 'Upload Test Article',
      category: 'Test',
      date: '2026-10-26',
      description: 'Testing image upload',
      content: 'Detailed article content for upload test.'
    }, 'image', 'test-upload.png', png1x1, boundary);

    const createNewsRes = await rawRequest('/api/news', 'POST', {
      'Cookie': cookie,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': newsBody.length
    }, newsBody);

    if (createNewsRes.status !== 201) {
      throw new Error(`Failed to create news: ${createNewsRes.body}`);
    }
    const createdNews = createNewsRes.json;
    console.log(`  ✓ News created with image: ${createdNews.image}`);

    const uploadedImagePath = path.join(__dirname, '..', 'public', createdNews.image);
    if (!fs.existsSync(uploadedImagePath)) {
      throw new Error(`Uploaded news image not found on disk at ${uploadedImagePath}`);
    }
    console.log('  ✓ Uploaded image file confirmed on disk');

    // 3. Test News Delete
    const deleteNewsRes = await rawRequest(`/api/news/${createdNews.id}`, 'DELETE', { 'Cookie': cookie });
    if (deleteNewsRes.status !== 200) {
      throw new Error(`Failed to delete news: ${deleteNewsRes.body}`);
    }
    console.log('  ✓ News article deleted from DB');

    // Give unlink a brief moment as it is async
    await new Promise(r => setTimeout(r, 100));

    if (fs.existsSync(uploadedImagePath)) {
      throw new Error('Image file was not deleted after news article deletion');
    }
    console.log('  ✓ Uploaded image file properly deleted from disk after article deletion');

    // 4. Test Gallery Create with image upload
    const galleryBody = makeMultipartBody({
      title: 'Gallery Upload Test',
      description: 'Testing gallery upload'
    }, 'image', 'gallery-test.png', png1x1, boundary);

    const createGalRes = await rawRequest('/api/gallery', 'POST', {
      'Cookie': cookie,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': galleryBody.length
    }, galleryBody);

    if (createGalRes.status !== 201) {
      throw new Error(`Failed to create gallery item: ${createGalRes.body}`);
    }
    const createdGal = createGalRes.json;
    console.log(`  ✓ Gallery item created with image: ${createdGal.image}`);

    const galImagePath = path.join(__dirname, '..', 'public', createdGal.image);
    if (!fs.existsSync(galImagePath)) {
      throw new Error(`Uploaded gallery image not found on disk`);
    }
    console.log('  ✓ Uploaded gallery image confirmed on disk');

    // 5. Test Gallery Delete
    const deleteGalRes = await rawRequest(`/api/gallery/${createdGal.id}`, 'DELETE', { 'Cookie': cookie });
    if (deleteGalRes.status !== 200) {
      throw new Error(`Failed to delete gallery item: ${deleteGalRes.body}`);
    }
    console.log('  ✓ Gallery item deleted from DB');

    await new Promise(r => setTimeout(r, 100));

    if (fs.existsSync(galImagePath)) {
      throw new Error('Image file was not deleted after gallery item deletion');
    }
    console.log('  ✓ Uploaded gallery image properly deleted from disk');

    console.log('\n[TEST] All multipart upload tests PASSED!\n');
  } catch (err) {
    console.error('[TEST] Upload test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
