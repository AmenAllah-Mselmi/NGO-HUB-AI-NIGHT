
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeams, createTeam, getTeamById, updateTeam, joinTeam, leaveTeam, deleteTeam } from "../services/teams.service";

export const TEAM_KEYS = {
    all: ['teams'] as const,
    lists: () => [...TEAM_KEYS.all, 'list'] as const,
    list: (filters: string) => [...TEAM_KEYS.lists(), { filters }] as const,
    details: () => [...TEAM_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...TEAM_KEYS.details(), id] as const,
};

export function useTeams(userId?: string) {
    return useQuery({
        queryKey: TEAM_KEYS.list(userId || 'all'),
        queryFn: () => getTeams(userId),
        enabled: !!userId,
    });
}

export function useTeamDetails(id?: string, currentUserId?: string) {
    return useQuery({
        queryKey: TEAM_KEYS.detail(id || ''),
        queryFn: async () => {
            const data = await getTeamById(id!);
            if (!data) return null;
            
            const isMember = currentUserId ? data.members?.some(m => m.member_id === currentUserId) : false;
            const myRole = currentUserId ? data.members?.find(m => m.member_id === currentUserId)?.role : undefined;
            
            return { ...data, is_member: isMember, my_role: myRole };
        },
        enabled: !!id,
    });
}

export function useJoinTeam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string, userId: string }) => joinTeam(teamId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEYS.detail(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
        },
    });
}

export function useLeaveTeam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string, userId: string }) => leaveTeam(teamId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEYS.detail(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
        },
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
        },
    });
}

export function useUpdateTeam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: { name: string, description?: string } }) => 
            updateTeam(id, updates),
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: TEAM_KEYS.details() });
                queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
            }
        },
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
        },
    });
}
