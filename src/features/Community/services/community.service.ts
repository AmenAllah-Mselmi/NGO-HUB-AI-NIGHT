import supabase from "../../../utils/supabase";

export interface ClubPost {
    id: string;
    club_id: string | null;
    author_id: string;
    title: string | null;
    content: string;
    image_url: string | null;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    author?: {
        fullname: string;
        avatar_url: string | null;
    };
    club?: {
        name: string;
        logo_url: string | null;
    };
    comments?: ClubComment[];
}

export interface ClubComment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    author?: {
        fullname: string;
        avatar_url: string | null;
    };
}

export async function getGlobalNewsFeed(): Promise<ClubPost[]> {
    const { data, error } = await supabase
        .from("club_posts")
        .select(`
            *,
            author:profiles(fullname, avatar_url),
            club:clubs(name, logo_url),
            comments:club_comments(
                id, content, created_at, author_id,
                author:profiles(fullname, avatar_url)
            )
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) throw error;
    return data as unknown as ClubPost[];
}

export async function getClubNewsFeed(clubId: string): Promise<ClubPost[]> {
    const { data, error } = await supabase
        .from("club_posts")
        .select(`
            *,
            author:profiles(fullname, avatar_url),
            club:clubs(name, logo_url),
            comments:club_comments(
                id, content, created_at, author_id,
                author:profiles(fullname, avatar_url)
            )
        `)
        .eq("club_id", clubId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as ClubPost[];
}

export async function createPost(payload: {
    club_id: string | null;
    author_id: string;
    title?: string;
    content: string;
    image_url?: string;
}) {
    // Ensure minimal profile exists for the author (may fix RLS failures when profile is missing)
    try {
        await supabase.from('profiles').upsert({ id: payload.author_id }).throwOnError();
    } catch (e) {
        // ignore upsert errors — we'll still try insert and surface the real error
    }

    // Insert then try to return the enriched post (with author, club, comments)
    const { data: inserted, error: insertErr } = await supabase
        .from("club_posts")
        .insert([payload])
        .select('id')
        .single();

    if (insertErr) {
        // If RLS error, try to give a helpful message and rethrow
        if (String(insertErr.message || '').toLowerCase().includes('row-level security') || String(insertErr.message || '').toLowerCase().includes('violates row-level')) {
            insertErr.message = 'Insertion blocked by Row-Level Security (missing profile or insufficient club membership). Ensure you are signed in and a member of the club (or post globally with club_id = null).';
        }
        throw insertErr;
    }

    try {
        const { data, error } = await supabase
            .from('club_posts')
            .select(`
                *,
                author:profiles(fullname, avatar_url),
                club:clubs(name, logo_url),
                comments:club_comments(
                    id, content, created_at, author_id,
                    author:profiles(fullname, avatar_url)
                )
            `)
            .eq('id', inserted.id)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (e) {
        // If RLS prevents the rich select, return the raw inserted row
        const { data: raw, error: rawErr } = await supabase
            .from('club_posts')
            .select('*')
            .eq('id', inserted.id)
            .maybeSingle();
        if (rawErr) throw rawErr;
        return raw;
    }
}

export async function addComment(payload: {
    post_id: string;
    author_id: string;
    content: string;
}) {
    const { data: inserted, error: insertErr } = await supabase
        .from('club_comments')
        .insert([payload])
        .select('id')
        .single();

    if (insertErr) throw insertErr;

    try {
        const { data, error } = await supabase
            .from('club_comments')
            .select(`*, author:profiles(fullname, avatar_url)`)
            .eq('id', inserted.id)
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (e) {
        const { data: raw, error: rawErr } = await supabase
            .from('club_comments')
            .select('*')
            .eq('id', inserted.id)
            .maybeSingle();
        if (rawErr) throw rawErr;
        return raw;
    }
}

export async function deletePost(postId: string) {
    const { error } = await supabase.from("club_posts").delete().eq("id", postId);
    if (error) throw error;
}

export async function deleteComment(commentId: string) {
    const { error } = await supabase.from("club_comments").delete().eq("id", commentId);
    if (error) throw error;
}
