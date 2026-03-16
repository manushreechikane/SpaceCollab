import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import type { LoginRequest, RegisterRequest, User, AuthResponse } from "@workspace/api-client-react/src/generated/api.schemas";

export function useCurrentUser() {
  const token = localStorage.getItem('spaceCollab_token');
  
  return useQuery<User>({
    queryKey: ['/api/auth/me'],
    queryFn: () => fetchWithAuth('/api/auth/me'),
    enabled: !!token,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      return (await res.json()) as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem('spaceCollab_token', data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      return (await res.json()) as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem('spaceCollab_token', data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    localStorage.removeItem('spaceCollab_token');
    queryClient.setQueryData(['/api/auth/me'], null);
    queryClient.clear();
    window.location.href = '/login';
  };
}
