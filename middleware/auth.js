// middleware/auth.js
// Checks whether the visitor has logged in as admin.

// For API routes: respond with an error if not logged in.
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();   // logged in, continue to the route
  }
  return res.status(401).json({ error: 'You must be logged in as admin.' });
}

// For admin HTML pages: redirect to the login page if not logged in.
function requireAdminPage(req, res, next) {
  if (req.path === '/login.html') {
    return next();   // the login page itself must be reachable
  }
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect('/admin/login.html');
}

module.exports = { requireAdmin, requireAdminPage };