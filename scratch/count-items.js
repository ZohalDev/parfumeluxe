import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const url = process.env.DATABASE_URL;
  const regex = /mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  const [_, user, password, host, port, database] = match;

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database
    });

    const [rows] = await connection.query('SELECT count(*) as count FROM products');
    console.log('Product count:', rows[0].count);
    
    const [cats] = await connection.query('SELECT count(*) as count FROM categories');
    console.log('Category count:', cats[0].count);

    if (rows[0].count === 0) {
        console.log('Attempting to re-seed without IGNORE...');
        // ... (I'll just check for now)
    }

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
