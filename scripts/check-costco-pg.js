const { Client } = require('pg');
require('dotenv').config({ path: '.env.costco' });

const connectionString = process.env.DATABASE_URL_COSTCO;

if (!connectionString) {
    console.error('Missing DATABASE_URL_COSTCO');
    process.exit(1);
}

console.log('Connecting via pg with connection string:');
console.log(connectionString.replace(/:[^:@]+@/, ':***@'));

const client = new Client({
    connectionString,
    connectionTimeoutMillis: 30_000,
    query_timeout: 30_000,
});

async function main() {
    try {
        await client.connect();
        console.log('Connected!');
        const res = await client.query('SELECT 1 AS ok, current_database() AS db, now() AS now');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

main();