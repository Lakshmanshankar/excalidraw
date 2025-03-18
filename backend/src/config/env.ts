
import { config } from 'dotenv';
config({ path: '.env' });

// export const DB_URL = process.env.DATABASE_URL || '';
export const DB_URL = process.env.DATABASE_URL_POOLED || '';
