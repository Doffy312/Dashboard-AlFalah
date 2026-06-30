import mysql from 'mysql2/promise';

async function check() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    });

    console.log('Connected to MySQL server!');
    
    await connection.query('CREATE DATABASE IF NOT EXISTS mosque_dashboard');
    console.log('Database mosque_dashboard created or already exists.');
    
    await connection.end();
  } catch (err) {
    console.error('MySQL Error:', err);
  }
}

check();
