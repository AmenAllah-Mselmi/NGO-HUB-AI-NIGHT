import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env file");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfiles() {
    console.log("Fetching all missing profiles...");

    // 1. Get all users
    // Note: auth.admin.listUsers() requires the Service Role Key. 
    // If you only have ANON key, you must run this inside the browser.
    // We'll generate a SQL query to ensure it forces the profiles table open.
    console.log("\nIf the SQL command failed, your profiles table Row-Level Security (RLS) might be blocking the trigger.");

    // Try inserting a dummy row to test RLS
    const { data: testData, error: testError } = await supabase.from('profiles').select('*').limit(1);
    console.log("\nProfiles Table Access Test:", testError ? "FAILED" : "SUCCESS", testError || "");

    if (testError && testError.code === '42P01') {
        console.log("\nERROR: The 'profiles' table DOES NOT EXIST in this database.");
    } else {
        console.log("\nYOUR FIX: Copy and run this EXACT block in your Supabase SQL Editor:");
        console.log(`
      -- 1. Temporarily disable security to force the insert
      ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      
      -- 2. Insert all missing users
      INSERT INTO public.profiles (id, email, fullname)
      SELECT id, email, raw_user_meta_data->>'fullname' FROM auth.users
      ON CONFLICT (id) DO NOTHING;
      
      -- 3. Re-enable security
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      `);
    }
}

fixProfiles();
