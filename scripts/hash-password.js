// scripts/hash-password.js
// Usage: npm run hash-password
// Asks for a password and prints a bcrypt hash to put into .env

const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Choose an admin password (at least 8 characters): ', (password) => {
  rl.close();

  if (password.length < 8) {
    console.log('Password is too short. Please run the script again.');
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 10);   // 10 = how much work the hashing does
  console.log('\nCopy this whole line into your .env file:\n');
  console.log('ADMIN_PASSWORD_HASH=' + hash);
});