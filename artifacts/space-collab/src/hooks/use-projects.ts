import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import type { 
  Project, ProjectDetail, CreateProjectRequest, UpdateProjectRequest,
  Comment, CreateCommentRequest, Experiment, CreateExperimentRequest,
  Message, SendMessageRequest
} from "@workspace/api-client-react/src/generated/api.schemas";

// --- PROJECTS ---

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: () => fetchWithAuth('/api/projects'),
  });
}

export function useProject(id: number) {
  return useQuery<ProjectDetail>({
    queryKey: ['/api/projects', id],
    queryFn: () => fetchWithAuth(`/api/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => 
      fetchWithAuth('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/projects'] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) => 
      fetchWithAuth(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchWithAuth(`/api/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/projects'] }),
  });
}

export function useJoinProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchWithAuth(`/api/projects/${id}/join`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
    },
  });
}

export function useLeaveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchWithAuth(`/api/projects/${id}/leave`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
    },
  });
}

// --- COMMENTS ---

export function useProjectComments(projectId: number) {
  return useQuery<Comment[]>({
    queryKey: ['/api/projects/comments', projectId],
    queryFn: () => fetchWithAuth(`/api/projects/${projectId}/comments`),
    enabled: !!projectId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: CreateCommentRequest }) => 
      fetchWithAuth(`/api/projects/${projectId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, { projectId }) => queryClient.invalidateQueries({ queryKey: ['/api/projects/comments', projectId] }),
  });
}

// --- EXPERIMENTS ---

export function useProjectExperiments(projectId: number) {
  return useQuery<Experiment[]>({
    queryKey: ['/api/projects/experiments', projectId],
    queryFn: () => fetchWithAuth(`/api/projects/${projectId}/experiments`),
    enabled: !!projectId,
  });
}

export function useAddExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: CreateExperimentRequest }) => 
      fetchWithAuth(`/api/projects/${projectId}/experiments`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, { projectId }) => queryClient.invalidateQueries({ queryKey: ['/api/projects/experiments', projectId] }),
  });
}

// --- CHAT MESSAGES ---

export function useProjectMessages(projectId: number) {
  return useQuery<Message[]>({
    queryKey: ['/api/messages', projectId],
    queryFn: () => fetchWithAuth(`/api/messages/${projectId}`),
    enabled: !!projectId,
    refetchInterval: 5000, // Poll every 5s for real-time feel
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: SendMessageRequest }) => 
      fetchWithAuth(`/api/messages/${projectId}`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, { projectId }) => queryClient.invalidateQueries({ queryKey: ['/api/messages', projectId] }),
  });
}
