import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiFetch<any>("/admin/stats"),
  });
}

export function useAdminActivity(limit = 10) {
  return useQuery({
    queryKey: ["admin-activity", limit],
    queryFn: () => apiFetch<any>(`/admin/activity?limit=${limit}`),
  });
}

export function useInstitutions() {
  return useQuery({
    queryKey: ["admin-institutions"],
    queryFn: () => apiFetch<any[]>("/admin/institutions"),
  });
}

export function useCreateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/admin/institutions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-institutions"] }),
  });
}

export function useUpdateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiFetch(`/admin/institutions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-institutions"] }),
  });
}

export function useDeleteInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/institutions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-institutions"] }),
  });
}

export function useOperators() {
  return useQuery({
    queryKey: ["admin-operators"],
    queryFn: () => apiFetch<any[]>("/admin/operators"),
  });
}

export function useCreateOperator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/admin/operators", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-operators"] }),
  });
}
