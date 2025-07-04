const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated JWT Secret:');
console.log(jwtSecret);
console.log('');
console.log('Copy this value to your .env.local file as JWT_SECRET=your_generated_secret'); 