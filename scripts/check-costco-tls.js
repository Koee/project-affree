const tls = require('tls');

const host = 'ep-damp-river-aom5jasj.c-2.ap-southeast-1.aws.neon.tech';
const port = 5432;

console.log(`Connecting TLS to ${host}:${port}...`);

const socket = tls.connect(
    {
        host,
        port,
        servername: host,
        rejectUnauthorized: false,
    },
    () => {
        console.log('TLS connected');
        console.log('Cipher:', JSON.stringify(socket.getCipher()));
        console.log('Authorized:', socket.authorized);
        socket.end();
    }
);

socket.setTimeout(20_000, () => {
    console.error('TLS timeout');
    socket.destroy();
    process.exitCode = 1;
});

socket.on('error', error => {
    console.error('TLS error:', error.message);
    process.exitCode = 1;
});