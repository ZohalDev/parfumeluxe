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

    const [rows] = await connection.query(
      'SELECT id, name, rating, image, description FROM products ORDER BY rating DESC LIMIT 10'
    );
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
