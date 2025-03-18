import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DB_URL } from '~/config/env';

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(DB_URL, { prepare: false });
export const db = drizzle(client);
