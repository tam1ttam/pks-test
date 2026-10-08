require('dotenv').config({ quiet: true });
const { Client } = require('pg');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

if (process.env.NODE_ENV === 'production') throw new Error('Demo seed must not run in production.');
const client = new Client({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 5432), user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE, connectionTimeoutMillis: 5000 });
(async () => {
  try {
    await client.connect();
    await client.query(readFileSync(resolve(__dirname, '../migration.sql'), 'utf8'));
    console.log('Demo seed applied. Existing demo profiles and passwords were preserved.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally { await client.end(); }
})();
