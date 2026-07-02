const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$queryRawUnsafe('select 1 as ok');
    console.log(JSON.stringify(result));
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
