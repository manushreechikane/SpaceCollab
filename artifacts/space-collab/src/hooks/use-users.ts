import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import type { User } from "@workspace/api-client-react/src/generated/api.schemas";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: () => fetchWithAuth('/api/users'),
  });
}
