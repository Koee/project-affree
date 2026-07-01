import dotenv from 'dotenv';

const environment = process.env.TEST_ENV || 'demo';

dotenv.config({
    path: `.env.${environment}`,
});

export const env = {
    BASE_URL: process.env.BASE_URL!,
    API_URL: process.env.API_URL!,
};

if (!env.BASE_URL) {
    throw new Error('Missing BASE_URL');
}