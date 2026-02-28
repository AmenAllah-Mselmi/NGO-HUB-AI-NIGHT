
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmhonwaoprtjxodmeigg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaG9ud2FvcHJ0anhvZG1laWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI1MDcsImV4cCI6MjA4Nzc3ODUwN30.NSnMn2AX5bpWu-kaHnOB_bOxwbtokTcPQsNiKAqeHy4'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfiles() {
    const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })

    if (error) {
        console.error('Error fetching profiles:', error)
    } else {
        console.log('Profiles count:', count)
        console.log('Profiles data (first 5):', JSON.stringify(data?.slice(0, 5), null, 2))
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
        console.log('Auth check error:', userError.message)
    } else {
        console.log('LoggedIn User ID:', userData.user.id)
        const { data: myProfile, error: myProfileErr } = await supabase.from('profiles').select('*').eq('id', userData.user.id).maybeSingle()
        console.log('My Profile exists:', !!myProfile)
        if (myProfileErr) console.log('My Profile error:', myProfileErr.message)
    }
}

checkProfiles()
