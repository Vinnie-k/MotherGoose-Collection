// Run this locally with: node generate-hash.js "YourActualPasswordHere"
// It prints a bcrypt hash you paste into ADMIN_PASSWORD_HASH in your .env
//
// Requires bcryptjs — the project already has it installed, so you can run
// this from inside your MotherGoose project folder directly:
//   node generate-hash.js "YourActualPasswordHere"
//
// Or, if running it standalone somewhere else, first run:
//   npm install bcryptjs
// in the same folder as this script.

const bcrypt = require('bcryptjs')

const password = process.argv[2]
if (!password) {
  console.error('Usage: node generate-hash.js "YourPasswordHere"')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
console.log('\nYour bcrypt hash (copy this into ADMIN_PASSWORD_HASH):\n')
console.log(hash)
console.log('')
