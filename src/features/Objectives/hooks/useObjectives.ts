
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { objectivesService } from "../services/objectives.service";

export const OBJECTIVE_KEYS = {
    all: ['objectives'] as const,
    lists: () => [...OBJECTIVE_KEYS.all, 'list'] as const,
    list: (filters: any) => [...OBJECTIVE_KEYS.lists(), { filters }] as const,
    details: () => [...OBJECTIVE_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...OBJECTIVE_KEYS.details(), id] as const,
    member: (memberId: string) => [...OBJECTIVE_KEYS.all, 'member', memberId] as const,
    stats: (memberId: string) => [...OBJECTIVE_KEYS.all, 'stats', memberId] as const,
};

export function useObjectives(activeOnly = true) {
    return useQuery({
        queryKey: OBJECTIVE_KEYS.list({ activeOnly }),
        queryFn: () => objectivesService.getObjectives(activeOnly),
    });
}

export function useMemberObjectives(memberId: string) {
    return useQuery({
        queryKey: OBJECTIVE_KEYS.member(memberId),
        queryFn: () => objectivesService.getMemberObjectives(memberId),
        enabled: !!memberId,
    });
}

export function usePointsStats(memberId: string) {
    return useQuery({
        queryKey: OBJECTIVE_KEYS.stats(memberId),
        queryFn: () => objectivesService.getPointsStats(memberId),
        enabled: !!memberId,
    });
}

export function useUpdateObjectiveProgress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ memberObjectiveId, increment }: { memberObjectiveId: string, increment: number }) => 
            objectivesService.updateProgress(memberObjectiveId, increment),
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: OBJECTIVE_KEYS.member(data.member_id) });
                queryClient.invalidateQueries({ queryKey: OBJECTIVE_KEYS.stats(data.member_id) });
                // Also invalidate general member stats if they depend on points
                queryClient.invalidateQueries({ queryKey: ['members', 'detail', data.member_id] });
            }
        },
    });
}
