const net = require('net');

const host = 'ep-damp-river-aom5jasj.c-2.ap-southeast-1.aws.neon.tech';
const port = 5432;
const maxAttempts = 6;
const delayMs = 5000;

function tryConnect(attempt) {
    console.log(`\nAttempt ${attempt}/${maxAttempts} - ${new Date().toISOString()}`);

    return new Promise(resolve => {
        const socket = net.createConnection({ host, port, timeout: 15_000 }, () => {
            console.log(`  connected ${host}:${port}`);
            socket.end();
            resolve(true);
        });

        socket.on('data', data => {
            console.log(`  data received: ${data.length} bytes`);
        });

        socket.on('timeout', () => {
            console.error(`  timeout ${host}:${port}`);
            socket.destroy();
            resolve(false);
        });

        socket.on('error', error => {
            console.error(`  error: ${error.code} - ${error.message}`);
            resolve(false);
        });
    });
}

async function main() {
    for (let i = 1; i <= maxAttempts; i++) {
        const ok = await tryConnect(i);
        if (ok) {
            console.log('\n=> Connection succeeded! Neon is warm.');
            return;
        }
        if (i < maxAttempts) {
            console.log(`  Waiting ${delayMs / 1000}s before retry...`);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    console.error('\n=> All attempts failed. Neon may be suspended or IP is blocked.');
    process.exitCode = 1;
}

main();