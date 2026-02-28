import { createClient } from '@supabase/supabase-js';
const s = createClient('https://vmhonwaoprtjxodmeigg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaG9ud2FvcHJ0anhvZG1laWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI1MDcsImV4cCI6MjA4Nzc3ODUwN30.NSnMn2AX5bpWu-kaHnOB_bOxwbtokTcPQsNiKAqeHy4');
async function test() {
    console.log('Fetching user...');
    try {
        const { data: users, error: uErr } = await s.from('profiles').select('id').limit(1);
        if (uErr || !users.length) return console.error('Err users', uErr);
        const uid = users[0].id;
        console.log('Testing assignment for user:', uid);

        const { data: t, error: tErr } = await s.from('tasks').insert({ title: 'Test Task', points: 10, status: 'todo' }).select().single();
        if (tErr) return console.error('Err creating task:', JSON.stringify(tErr));
        console.log('Task created:', t.id);

        const { data: mt, error: mtErr } = await s.from('member_tasks').insert({ member_id: uid, task_id: t.id, status: 'todo', progress_percentage: 0, tracking_type: 'manual', completed_subtask_ids: [] }).select().single();
        if (mtErr) return console.error('Err assigning:', JSON.stringify(mtErr));
        console.log('Assigned:', mt.id);
    } catch (e) {
        console.error("Exception:", e);
    }
}
test();
