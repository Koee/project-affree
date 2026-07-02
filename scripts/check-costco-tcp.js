const net = require('net');

const host = process.argv[2];
const port = Number(process.argv[3] || 5432);

const socket = net.createConnection({ host, port, timeout: 10_000 }, () => {
    console.log(`connected ${host}:${port}`);
    socket.end();
});

socket.on('timeout', () => {
    console.error(`timeout ${host}:${port}`);
    socket.destroy();
    process.exitCode = 1;
});

socket.on('error', error => {
    console.error(error);
    process.exitCode = 1;
});
