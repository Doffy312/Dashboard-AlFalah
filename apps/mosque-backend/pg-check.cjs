const { Client } = require('pg');

async function check() {
  // First try to connect to the default postgres DB to see if the server is running
  const client = new Client({
    connectionString: 'postgresql://postgres:password@localhost:5432/postgres'
  });
  
  try {
    await client.connect();
    console.log('Postgres server is running!');
    
    // Check if mosque_dashboard exists
    const res = await client.query("SELECT datname FROM pg_catalog.pg_database WHERE datname = 'mosque_dashboard'");
    if (res.rows.length === 0) {
      console.log('Database mosque_dashboard does not exist. Creating it...');
      await client.query('CREATE DATABASE mosque_dashboard');
      console.log('Database created successfully!');
    } else {
      console.log('Database mosque_dashboard already exists.');
    }
    await client.end();
  } catch (e) {
    console.error('Connection failed:', e.message);
  }
}

check();
