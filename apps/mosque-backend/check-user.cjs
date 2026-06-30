const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres:password@localhost:5432/mosque_dashboard'
  });
  
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM "user"');
    console.log('Users in DB:');
    console.log(res.rows);
    await client.end();
  } catch (e) {
    console.error('Full Error:', e);
  }
}

check();
