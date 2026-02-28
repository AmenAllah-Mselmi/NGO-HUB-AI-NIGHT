import supabase from "../../../utils/supabase";
import type { MemberExperience, MemberProject } from "../types";

// ==========================================
// EXPERIENCES (CV Associatif)
// ==========================================

export async function getMemberExperiences(memberId: string): Promise<MemberExperience[]> {
    const { data, error } = await supabase
        .from("member_experiences")
        .select("*")
        .eq("member_id", memberId)
        .order("start_date", { ascending: false, nullsFirst: false });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function createExperience(
    memberId: string,
    experience: Omit<MemberExperience, "id" | "member_id" | "created_at">
): Promise<MemberExperience> {
    const { data, error } = await supabase
        .from("member_experiences")
        .insert([{ ...experience, member_id: memberId }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateExperience(
    id: string,
    updates: Partial<Omit<MemberExperience, "id" | "member_id" | "created_at">>
): Promise<MemberExperience> {
    const { data, error } = await supabase
        .from("member_experiences")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteExperience(id: string): Promise<void> {
    const { error } = await supabase.from("member_experiences").delete().eq("id", id);
    if (error) throw new Error(error.message);
}

// ==========================================
// PROJECTS (Portfolio)
// ==========================================

export async function getMemberProjects(memberId: string): Promise<MemberProject[]> {
    const { data, error } = await supabase
        .from("member_projects")
        .select("*")
        .eq("member_id", memberId)
        .order("completion_date", { ascending: false, nullsFirst: false });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function createProject(
    memberId: string,
    project: Omit<MemberProject, "id" | "member_id" | "created_at">
): Promise<MemberProject> {
    const { data, error } = await supabase
        .from("member_projects")
        .insert([{ ...project, member_id: memberId }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateProject(
    id: string,
    updates: Partial<Omit<MemberProject, "id" | "member_id" | "created_at">>
): Promise<MemberProject> {
    const { data, error } = await supabase
        .from("member_projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("member_projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
