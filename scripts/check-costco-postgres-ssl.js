const net = require('net');
const tls = require('tls');

const host = process.argv[2];
const port = Number(process.argv[3] || 5432);

const socket = net.createConnection({ host, port, timeout: 10_000 }, () => {
    const request = Buffer.alloc(8);
    request.writeInt32BE(8, 0);
    request.writeInt32BE(80877103, 4);
    socket.write(request);
});

socket.once('data', chunk => {
    const response = chunk.toString('utf8', 0, 1);

    if (response !== 'S') {
        console.error(`postgres ssl rejected: ${response}`);
        socket.destroy();
        process.exitCode = 1;
        return;
    }

    const secureSocket = tls.connect(
        {
            socket,
            servername: host,
            rejectUnauthorized: true,
        },
        () => {
            console.log(`postgres ssl ok ${host}:${port}`);
            secureSocket.end();
        }
    );

    secureSocket.on('error', error => {
        console.error(error);
        process.exitCode = 1;
    });
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
