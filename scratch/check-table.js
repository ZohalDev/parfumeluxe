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

    const [rows] = await connection.query('DESCRIBE `users`;');
    console.log('Users table structure:');
    console.table(rows);
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
