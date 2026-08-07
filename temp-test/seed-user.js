// ⚠️ Script ini hanya untuk development/seeding awal.
// Jangan commit kredensial ke repository!
// Gunakan: node seed-user.js

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const name = process.env.SEED_ADMIN_NAME || 'Admin Al-Falah';
const apiUrl = process.env.API_URL || 'http://localhost:3000';

if (!email || !password) {
  console.error('❌ Error: Set environment variables terlebih dahulu:');
  console.error('   SEED_ADMIN_EMAIL=admin@example.com');
  console.error('   SEED_ADMIN_PASSWORD=your_secure_password');
  console.error('');
  console.error('Contoh:');
  console.error('   SEED_ADMIN_EMAIL=admin@alfalah.org SEED_ADMIN_PASSWORD=SecurePass123! node seed-user.js');
  process.exit(1);
}

fetch(`${apiUrl}/api/auth/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
})
  .then(res => res.json())
  .then(data => console.log('✅ Response:', data))
  .catch(err => console.error('❌ Error:', err));
