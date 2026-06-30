import mysql from 'mysql2/promise';

const passwords = ['', 'root', 'password', '123456', 'admin'];

async function check() {
  for (const pw of passwords) {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pw,
        port: 3306
      });

      console.log(`Success with password: "${pw}"`);
      await connection.query('CREATE DATABASE IF NOT EXISTS mosque_dashboard');
      console.log('Database mosque_dashboard created or already exists.');
      await connection.end();
      return;
    } catch (err) {
      // ignore
    }
  }
  console.log('Failed to connect with common passwords.');
}

check();
