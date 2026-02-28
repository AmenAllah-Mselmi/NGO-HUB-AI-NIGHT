import { createClient } from '@supabase/supabase-js';
const s = createClient('https://vmhonwaoprtjxodmeigg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaG9ud2FvcHJ0anhvZG1laWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI1MDcsImV4cCI6MjA4Nzc3ODUwN30.NSnMn2AX5bpWu-kaHnOB_bOxwbtokTcPQsNiKAqeHy4');
async function test() {
    try {
        console.log("Testing tasks insert...");
        const newTaskPayload = {
            title: "Test Task full",
            description: "Test description",
            points: 10,
            status: 'todo',
            start_date: undefined,
            deadline: undefined,
            complexity: undefined,
            team_id: undefined,
            milestone_id: undefined,
            attachments: [],
            subtasks: []
        };
        const { data, error } = await s.from('tasks').insert(newTaskPayload).select().single();
        if (error) {
            console.error("Tasks insert error:", JSON.stringify(error));
        } else {
            console.log("Tasks insert success:", data.id);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}
test();
