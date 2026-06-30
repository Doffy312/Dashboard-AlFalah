fetch('http://localhost:3000/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
  body: JSON.stringify({ email: 'admin_alfalah@example.com', password: 'password123', name: 'Admin Al-Falah' })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
