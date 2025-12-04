const bcrypt = require('bcryptjs');

// Change these values to whatever you want
const securityKey = 'adminkey';

// Generate hash
const hash = bcrypt.hashSync(securityKey, 10);

console.log('='.repeat(60));
console.log('BCRYPT HASH GENERATOR');
console.log('='.repeat(60));
console.log('\nSecurity Key:', securityKey);
console.log('Bcrypt Hash:', hash);
console.log('\n📋 Copy the hash above and paste it into MongoDB Atlas');
console.log('   as the value for the "securityKey" field');
console.log('='.repeat(60));
