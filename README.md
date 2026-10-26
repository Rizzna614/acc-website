# Assetto Corsa Competizione (ACC) Informational Fan Website

A complete, full-stack informational website and content management system dedicated to **Assetto Corsa Competizione (ACC)**, built for a school web development assignment adhering to both assignment specifications.

---

## 1. Project Overview & Features

### Public Website
- **Homepage (`/`)**: Displays dynamically loaded game branding, summary, hero section, and the latest news articles.
- **Description (`/description.html`)**: Detailed overview of the game including developer, publisher, release year, platforms, genre, and comprehensive background facts fetched directly from the database.
- **Content (`/content.html`)**: Full catalogue of GT3 and GT4 race cars and laser-scanned racing circuits with interactive category filtering tabs.
- **Car Details (`/car.html?id=:id`)**: Dedicated detail page for every car showing technical specifications (class badge, engine, horsepower, weight, model year, and description).
- **Circuit Details (`/circuit.html?id=:id`)**: Dedicated detail page for every circuit showing track facts (country, track length in km, turn count, and track guide).
- **News (`/news.html`)**: List of published news articles and guides with category filters.
- **News Details (`/news-details.html?id=:id`)**: Full-page article view with cover image, category badge, publication date, and multi-paragraph formatted content. (Demonstrates `Home → News → News Details` user journey).
- **Gallery (`/gallery.html`)**: In-game screenshot showcase with titles, descriptions, and a responsive image modal lightbox viewer.
- **Search (`/search.html?q=:query`)**: Real-time search engine querying cars, circuits, and news with match counters and direct links.
- **Custom 404 Error Page (`/404.html`)**: Friendly error screen for unknown routes with navigation back to the homepage.

### Admin Panel (Protected)
- **Session-Based Authentication (`/admin/login.html`)**: Secure password hashing with `bcryptjs`, session cookies, and brute-force protection.
- **Edit Game Information (`/admin/game.html`)**: Edit developer, publisher, genre, release year, platforms, short description, and full description.
- **Manage News (`/admin/news.html`)**: Full CRUD (Create, Read, Update, Delete) for news articles including category, title, description, content, date, and local image uploads.
- **Manage Gallery (`/admin/gallery.html`)**: Full CRUD for gallery items with image upload, title, and description.

---

## 2. Technology Stack

- **Frontend**: Vanilla HTML5, CSS3 (custom responsive styling, CSS variables, desktop-first design), and Vanilla JavaScript (ES6+ Fetch API, no heavy external libraries).
- **Backend**: Node.js and Express.js (v5).
- **Database**: SQLite via `better-sqlite3` (lightweight, zero-configuration file database).
- **Image Uploads**: `multer` with file-type signature sniffing and size restrictions.
- **Security**: `express-session` for HTTP-only cookies and `bcryptjs` for secure password hashing.

---

## 3. Project Directory Structure

```text
acc-website/
├── .env                     # Environment variables (session secret, credentials)
├── .env.example             # Example environment file
├── .gitignore               # Git ignore list
├── package.json             # Project dependencies and npm scripts
├── server.js                # Express application entry point
├── database/
│   ├── acc.db               # SQLite database file (created on init)
│   ├── db.js                # Database connection & initialization module
│   └── init.sql             # SQL schema and starter seed data
├── middleware/
│   ├── auth.js              # Admin authentication check middleware
│   └── upload.js            # Image upload & validation middleware (Multer)
├── public/                  # Public static assets & frontend files
│   ├── 404.html             # Custom 404 error page
│   ├── car.html             # Single car detail page
│   ├── circuit.html         # Single circuit detail page
│   ├── content.html         # Cars & circuits catalog with tabs
│   ├── description.html     # Game facts & background page
│   ├── gallery.html         # Public screenshot gallery & lightbox
│   ├── index.html           # Homepage
│   ├── news.html            # News article list
│   ├── news-details.html    # Full news article page
│   ├── search.html          # Search results page
│   ├── admin/               # Admin pages (protected by middleware)
│   │   ├── gallery.html     # Manage gallery items
│   │   ├── gallery.js       # Admin gallery logic & image upload
│   │   ├── game.html        # Edit game information
│   │   ├── game.js          # Admin game information editor logic
│   │   ├── login.html       # Admin login screen
│   │   ├── login.js         # Admin login authentication client
│   │   ├── news.html        # Manage news articles
│   │   └── news.js          # Admin news CRUD logic & image upload
│   ├── css/
│   │   └── style.css        # Clean, modern motorsport stylesheet
│   ├── images/              # Static icons & hero graphics
│   │   ├── hero.jpg
│   │   └── placeholder.svg
│   ├── js/                  # Frontend scripts
│   │   ├── car.js
│   │   ├── circuit.js
│   │   ├── content.js
│   │   ├── description.js
│   │   ├── gallery.js
│   │   ├── home.js
│   │   ├── news.js
│   │   ├── news-details.js
│   │   ├── search.js
│   │   └── utils.js         # Shared helpers, headers, footers & cards
│   └── uploads/             # Directory for user-uploaded images
├── routes/                  # Express REST API routes
│   ├── auth.js              # /api/login, /api/logout, /api/session
│   ├── cars.js              # /api/cars, /api/cars/:id
│   ├── circuits.js          # /api/circuits, /api/circuits/:id
│   ├── gallery.js           # /api/gallery (GET, POST, PUT, DELETE)
│   ├── game.js              # /api/game (GET, PUT)
│   ├── news.js              # /api/news (GET, POST, PUT, DELETE)
│   └── search.js            # /api/search?q=:query
└── scripts/
    └── hash-password.js     # CLI tool to generate bcrypt password hashes
```

---

## 4. Installation & Setup (Windows)

### Prerequisites
1. Ensure [Node.js](https://nodejs.org/) (version 20 or higher) is installed on your computer.
2. Open PowerShell or Command Prompt in the project directory (`c:\Users\User\RRazna\acc-website`).

### Step 1: Install Dependencies
Run:
```bash
npm install
```
*(On Windows PowerShell, if execution policies block `npm`, run `npm.cmd install` or `node -v` to verify Node.js).*

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` (if not already present):
```powershell
Copy-Item .env.example .env
```
Default `.env` configuration:
```ini
PORT=3000
SESSION_SECRET=82685184f22f7332ed0835d8a8b8b224511a42735332ae01da0f3cf1f2444c8a
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$AianxKI3C6gR2HV7Ev20Bev6LSWW05mDe0zeoMvm.26LcedOlgz.m
```
*Note: The default admin password hash corresponds to password: `admin123`.*

### Step 3: (Optional) Set a Custom Admin Password
To generate your own hashed password:
```bash
node scripts/hash-password.js
```
Type your chosen password when prompted, copy the output line, and paste it into your `.env` file under `ADMIN_PASSWORD_HASH=`.

### Step 4: Initialize the SQLite Database
To set up the SQLite database and seed initial starter data:
```bash
node database/db.js
```
You should see:
```text
game_info: 1 rows
cars: 9 rows
circuits: 6 rows
news: 3 rows
gallery: 4 rows
```

### Step 5: Start the Server
Launch the application:
```bash
npm start
```
or:
```bash
node server.js
```
Open your browser and visit:
```text
http://localhost:3000
```

---

## 5. Beginner-Friendly Explanations of Key Concepts

### How Express Routes Work
Express acts as a traffic director on the web server. When a browser sends a request (for example, `GET /api/cars`), Express matches that method and path to a specific handler function in `routes/cars.js`:
```javascript
router.get('/', (req, res) => {
  const cars = db.prepare('SELECT * FROM cars').all();
  res.json(cars); // Sends the data back to the browser formatted as JSON
});
```

### How the Frontend Requests Data (`fetchJson`)
Rather than reloading the whole page every time data is needed, frontend JavaScript makes an asynchronous request behind the scenes using the standard `fetch()` API. The shared function `fetchJson(url)` in `public/js/utils.js` handles sending requests, checking response status codes, and parsing the JSON response.

### How SQLite Stores Data
SQLite is a serverless, single-file database. All tables (`game_info`, `cars`, `circuits`, `news`, `gallery`) are stored inside `database/acc.db`. Using the `better-sqlite3` library in Node.js, we execute fast SQL queries with parameterized statements (using `?` placeholders) which guarantees safety against SQL injection attacks.

### How CRUD Operations Work
CRUD represents the four fundamental database actions:
1. **Create (`POST`)**: Admin adds a new news article or gallery image.
2. **Read (`GET`)**: Public and admin visitors view articles, cars, circuits, and images.
3. **Update (`PUT`)**: Admin modifies existing game facts, news, or gallery entries.
4. **Delete (`DELETE`)**: Admin removes news or gallery items from the database.

### How Admin Authentication Protects Modifications
Admin-only routes and pages are protected using an Express session cookie (`acc.sid`). When the administrator logs in:
1. `routes/auth.js` checks the username and compares the password against the bcrypt hash.
2. If valid, Express stores `req.session.isAdmin = true`.
3. Any sensitive route (like `PUT /api/game` or `DELETE /api/news/:id`) runs the `requireAdmin` middleware. If `isAdmin` is not present, it immediately rejects the request with HTTP 401 Unauthorized.

### How Search Works
The search feature in `routes/search.js` takes a query string (e.g., `?q=monza`) and uses SQL `LIKE %query%` across cars, circuits, and news titles, categories, and descriptions. It formats all matching results into a uniform structure and delivers them to `/search.html`.

---

## 6. Manual Testing Checklist

| Step | Page / Feature | Expected Behavior |
| :--- | :--- | :--- |
| 1 | **Homepage (`/`)** | Loads game title, short summary from DB, hero section, and latest 3 news items. |
| 2 | **Description (`/description.html`)** | Displays game facts (Developer, Publisher, Release Year, Genre, Platforms, Description) from DB. |
| 3 | **Content (`/content.html`)** | Shows cars and circuits. Clicking tabs (`All`, `GT3 Cars`, `GT4 Cars`, `Circuits`) filters items. |
| 4 | **Car Details (`/car.html?id=1`)** | Shows car image, overview, specs table, and breadcrumb navigation back to Content. |
| 5 | **Circuit Details (`/circuit.html?id=1`)** | Shows track image, overview, country, length, turn count, and breadcrumb back to Content. |
| 6 | **News (`/news.html`)** | Lists articles with category tags, descriptions, dates, and cover images. |
| 7 | **News Details (`/news-details.html?id=1`)** | Displays article, breadcrumb (`Home → News → Article Title`), image, and full content. |
| 8 | **Gallery (`/gallery.html`)** | Shows gallery grid. Clicking any card opens the image in a lightbox modal viewer. |
| 9 | **Search (`/search.html`)** | Searching for "Porsche" or "Monza" lists matching cards with direct links. |
| 10 | **404 Page (`/unknown-page`)** | Visiting an invalid URL returns the custom 404 page with HTTP status 404. |
| 11 | **Admin Protected (`/admin/game.html`)** | When logged out, redirects immediately to `/admin/login.html`. |
| 12 | **Admin Login (`/admin/login.html`)** | Logging in with `admin` / `admin123` redirects to `/admin/game.html`. |
| 13 | **Admin Game Info (`/admin/game.html`)** | Modifying fields and clicking "Save Changes" updates the DB; verified on `/description.html`. |
| 14 | **Admin News CRUD (`/admin/news.html`)** | Add new article with image upload, edit existing article, delete article. Changes persist in DB. |
| 15 | **Admin Gallery CRUD (`/admin/gallery.html`)** | Add new gallery item with image upload, edit title/desc, delete item. Verified on `/gallery.html`. |
| 16 | **Admin Logout** | Clicking "Log out" destroys the session and redirects to `/admin/login.html`. |
