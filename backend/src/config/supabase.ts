import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env' });
const SUPABSE_URL = process.env.SUPABASE_URL || '';
const SUPABSE_KEY = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABSE_URL, SUPABSE_KEY);

export enum BUCKET {
    EXCLALIDRAW = 'excalidraw',
}
