const { Client } = require('pg');
require('dotenv').config({ path: '.env.costco' });

const connectionString = process.env.DATABASE_URL_COSTCO;

if (!connectionString) {
    console.error('Missing DATABASE_URL_COSTCO');
    process.exit(1);
}

const maxAttempts = 5;
const delayMs = 8000;

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function tryConnect(attempt) {
    console.log(`\nAttempt ${attempt}/${maxAttempts} - ${new Date().toISOString()}`);

    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 60_000,
        query_timeout: 60_000,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await client.connect();
        console.log('  Connected!');
        const res = await client.query('SELECT 1 AS ok, current_database() AS db, now() AS now');
        console.log('  Query result:', JSON.stringify(res.rows, null, 2));
        await client.end();
        return true;
    } catch (error) {
        console.error(`  Error: ${error.code || ''} - ${error.message}`);
        try { await client.end(); } catch (e) { }
        return false;
    }
}

async function main() {
    for (let i = 1; i <= maxAttempts; i++) {
        const ok = await tryConnect(i);
        if (ok) {
            console.log('\n=> Connection succeeded!');
            return;
        }
        if (i < maxAttempts) {
            console.log(`  Waiting ${delayMs / 1000}s before retry (Neon cold start can take time)...`);
            await sleep(delayMs);
        }
    }
    console.error('\n=> All attempts failed.');
    console.error('Possible causes:');
    console.error('  1. Neon project is suspended/deleted - check Neon dashboard');
    console.error('  2. IP is blocked by Neon IP Allow list');
    console.error('  3. Network/firewall blocking Postgres protocol');
    console.error('  4. Wrong credentials/endpoint');
    process.exitCode = 1;
}

main();