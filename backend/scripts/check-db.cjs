require('dotenv').config({ quiet: true });
const { Client } = require('pg');
const client = new Client({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE, connectionTimeoutMillis: 5000 });
(async () => {
  try {
    await client.connect();
    const result = await client.query('SELECT current_database() AS database, current_user AS username');
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    console.log('Connected:', result.rows[0]);
    console.log('Existing tables:', tables.rows.map(row => row.tablename));
  } catch (error) {
    console.error('Database check failed:', error.code || error.message);
    process.exitCode = 1;
  } finally { await client.end(); }
})();
