// database/db.js
// Opens the SQLite database and creates tables + starter data on first run.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'acc.db');
const db = new Database(dbPath);   // creates the file if it does not exist
db.pragma('foreign_keys = ON');    // enforce foreign key constraints

// Has the database been set up already? (We look for the game_info table.)
const alreadySetUp = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'game_info'")
  .get();

if (!alreadySetUp) {
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  // A transaction means "all or nothing": if one statement fails, nothing is saved.
  db.transaction(() => {
    db.exec(sql);
  })();
  console.log('Database created and filled with starter data.');
}

module.exports = db;

// If you run "npm run init-db", this prints how many rows each table has.
if (require.main === module) {
  const tables = ['game_info', 'cars', 'circuits', 'news', 'gallery'];
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
    console.log(`${table}: ${row.count} rows`);
  }
}
