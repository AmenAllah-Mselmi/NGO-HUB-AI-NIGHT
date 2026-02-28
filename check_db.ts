
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmhonwaoprtjxodmeigg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaG9ud2FvcHJ0anhvZG1laWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI1MDcsImV4cCI6MjA4Nzc3ODUwN30.NSnMn2AX5bpWu-kaHnOB_bOxwbtokTcPQsNiKAqeHy4'
const supabase = createClient(supabaseUrl, supabaseKey)

async function listTables() {
    const { data, error } = await supabase
        .rpc('get_tables') // This might not exist, alternative:

    const { data: tables, error: err } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

    if (err) {
        // Fallback: try to select from a common table
        const { error: profileErr } = await supabase.from('profiles').select('id').limit(1)
        console.log('Profiles table exists:', !profileErr)

        const { error: challengeErr } = await supabase.from('challenges').select('id').limit(1)
        console.log('Challenges table exists:', !challengeErr)
        if (challengeErr) console.log('Challenge error:', challengeErr.message)
    } else {
        console.log('Tables in public schema:', tables.map(t => t.table_name).join(', '))
    }
}

listTables()
