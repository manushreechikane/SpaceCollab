import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import type { Resource } from "@workspace/api-client-react/src/generated/api.schemas";

export function useResources() {
  return useQuery<Resource[]>({
    queryKey: ['/api/resources'],
    queryFn: () => fetchWithAuth('/api/resources'),
  });
}
