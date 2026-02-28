import { createClient } from '@supabase/supabase-js';
const s = createClient('https://vmhonwaoprtjxodmeigg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaG9ud2FvcHJ0anhvZG1laWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI1MDcsImV4cCI6MjA4Nzc3ODUwN30.NSnMn2AX5bpWu-kaHnOB_bOxwbtokTcPQsNiKAqeHy4');
async function test() {
    try {
        const { error: err2 } = await s.from('member_tasks').insert({}).select();
        console.log("Insert err payload:", JSON.stringify(err2));
    } catch (e) {
        console.error("Exception:", e);
    }
}
test();
