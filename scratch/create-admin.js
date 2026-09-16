import mysql from 'mysql2/promise';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

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

    const email = 'mohamedzohal03@gmail.com';
    const rawPassword = 'zohal2003@';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const unionId = randomBytes(16).toString('hex');

    // Check if user exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.query(
        'UPDATE users SET password = ?, role = "admin" WHERE email = ?',
        [hashedPassword, email]
      );
      console.log(`User ${email} updated to Admin.`);
    } else {
      await connection.query(
        'INSERT INTO users (unionId, name, email, password, role, lastSignInAt) VALUES (?, ?, ?, ?, ?, ?)',
        [unionId, 'Admin Mohamed', email, hashedPassword, 'admin', new Date()]
      );
      console.log(`Admin account ${email} created successfully!`);
    }

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
