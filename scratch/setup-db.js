import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is missing');
    return;
  }

  // Parse connection string to get credentials without the DB name
  // Format: mysql://user:pass@host:port/db
  const regex = /mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    console.error('Invalid DATABASE_URL format');
    return;
  }

  const [_, user, password, host, port, database] = match;

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
    });

    console.log(`Connected to MySQL at ${host}:${port}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    console.log(`Database "${database}" verified/created.`);
    await connection.end();
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nTIP: It seems your MySQL password is wrong or missing.');
      console.log('Please check your XAMPP/WAMP settings.');
    }
  }
}

main();
