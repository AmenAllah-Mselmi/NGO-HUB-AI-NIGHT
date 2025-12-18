import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityService } from "../services/activityService";
import type { ActivityFilterDTO, CreateActivityDTO, UpdateActivityDTO } from "../dto/ActivityDTOs";

export const ACTIVITY_KEYS = {
    all: ['activities'] as const,
    lists: () => [...ACTIVITY_KEYS.all, 'list'] as const,
    list: (filters: ActivityFilterDTO) => [...ACTIVITY_KEYS.lists(), { filters : filters }] as const,
    details: () => [...ACTIVITY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...ACTIVITY_KEYS.details(), id] as const,
};

export function useActivities(initialFilters?: ActivityFilterDTO) {
    const [filters, setFilters] = useState<ActivityFilterDTO>(initialFilters || {});
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ACTIVITY_KEYS.list(filters),
        queryFn: () => activityService.getActivities(Object.keys(filters).length > 0 ? filters : undefined),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateActivityDTO) => activityService.createActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.lists() });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateActivityDTO }) => 
            activityService.updateActivity(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.detail(data.id) });
        },
    });

    const fetchActivities = useCallback((newFilters?: ActivityFilterDTO) => {
        setFilters(newFilters || {});
    }, []);

    // Helper for useActivityForm compatibility
    const fetchActivityById = async (id: string) => {
        return activityService.getActivityById(id);
    };

    return {
        activities: query.data || [],
        data: query.data || [], // Compatibility
        loading: query.isLoading,
        isLoading: query.isLoading, // Compatibility
        error: query.error,
        fetchActivities,
        fetchActivityById,
        createActivity: async (data: CreateActivityDTO) => {
            try {
                const activity = await createMutation.mutateAsync(data);
                return { success: true, activity };
            } catch (err: any) {
                return { success: false, error: err.message };
            }
        },
        updateActivity: async (id: string, data: UpdateActivityDTO) => {
            try {
                await updateMutation.mutateAsync({ id, data });
                return { success: true };
            } catch (err: any) {
                return { success: false, error: err.message };
            }
        },
        refetch: query.refetch
    };
}

export function useActivity(id?: string) {
    return useQuery({
        queryKey: ACTIVITY_KEYS.detail(id || ''),
        queryFn: () => activityService.getActivityById(id!),
        enabled: !!id,
    });
}
