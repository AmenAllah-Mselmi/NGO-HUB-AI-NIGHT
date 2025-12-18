
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recruitmentService } from "../services/recruitmentService";

export const RECRUITMENT_KEYS = {
    all: ['recruitment'] as const,
    candidates: () => [...RECRUITMENT_KEYS.all, 'candidates'] as const,
    templates: () => [...RECRUITMENT_KEYS.all, 'templates'] as const,
    template: (id: string) => [...RECRUITMENT_KEYS.templates(), id] as const,
    evaluations: (candidateId: string) => [...RECRUITMENT_KEYS.all, 'evaluations', candidateId] as const,
};

export function useCandidates() {
    return useQuery({
        queryKey: RECRUITMENT_KEYS.candidates(),
        queryFn: () => recruitmentService.getCandidates(),
    });
}

export function useTemplates() {
    return useQuery({
        queryKey: RECRUITMENT_KEYS.templates(),
        queryFn: () => recruitmentService.getTemplates(),
    });
}

export function useTemplate(id?: string) {
    return useQuery({
        queryKey: RECRUITMENT_KEYS.template(id || ''),
        queryFn: () => recruitmentService.getTemplateById(id!),
        enabled: !!id,
    });
}

export function useAllEvaluations() {
    return useQuery({
        queryKey: [...RECRUITMENT_KEYS.all, 'evaluations', 'all'],
        queryFn: () => recruitmentService.getAllEvaluations(),
    });
}

export function useCreateCandidate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: recruitmentService.addCandidate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RECRUITMENT_KEYS.candidates() });
        },
    });
}

export function useUpdateCandidate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => recruitmentService.updateCandidate(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RECRUITMENT_KEYS.candidates() });
        },
    });
}

export function useDeleteCandidate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: recruitmentService.deleteCandidate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RECRUITMENT_KEYS.candidates() });
        },
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: recruitmentService.deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RECRUITMENT_KEYS.templates() });
        },
    });
}
