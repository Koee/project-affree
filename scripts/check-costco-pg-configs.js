const { Client } = require('pg');
require('dotenv').config({ path: '.env.costco' });

const baseUrl = 'postgresql://neondb_owner:npg_l7rACjf1zmYE@ep-damp-river-aom5jasj.c-2.ap-southeast-1.aws.neon.tech/neondb';

console.log('Testing clean connection string (no extra params)...');
console.log('URL:', baseUrl.replace(/:[^:@]+@/, ':***@'));

const configs = [
    {
        name: 'sslmode=require (clean URL)',
        connectionString: baseUrl + '?sslmode=require',
    },
    {
        name: 'ssl rejectUnauthorized=false',
        connectionString: baseUrl,
        ssl: { rejectUnauthorized: false },
    },
    {
        name: 'no SSL',
        connectionString: baseUrl + '?sslmode=disable',
    },
];

async function tryConfig(cfg) {
    console.log(`\n--- ${cfg.name} ---`);
    const client = new Client({
        connectionString: cfg.connectionString,
        connectionTimeoutMillis: 30_000,
        ssl: cfg.ssl,
    });

    try {
        await client.connect();
        console.log('  Connected!');
        const res = await client.query('SELECT 1 AS ok, current_database() AS db');
        console.log('  Result:', JSON.stringify(res.rows));
        await client.end();
        return true;
    } catch (error) {
        console.error(`  Error: ${error.code || ''} - ${error.message}`);
        try { await client.end(); } catch (e) { }
        return false;
    }
}

async function main() {
    for (const cfg of configs) {
        const ok = await tryConfig(cfg);
        if (ok) {
            console.log('\n=> Success! Use this config.');
            return;
        }
    }
    console.error('\n=> All configs failed. Neon endpoint is likely suspended/deleted or IP is blocked.');
    process.exitCode = 1;
}

main();