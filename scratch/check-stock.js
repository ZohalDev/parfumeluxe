import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const url = process.env.DATABASE_URL;
  const regex = /mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  if (!match) {
    console.error('Invalid DATABASE_URL');
    return;
  }
  const [_, user, password, host, port, database] = match;

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database
    });

    const [products] = await connection.query('SELECT id, name, stock FROM products');
    console.log('--- PRODUCTS STOCK ---');
    products.forEach(p => {
      console.log(`ID: ${p.id} | Name: ${p.name} | Stock: ${p.stock}`);
    });
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
