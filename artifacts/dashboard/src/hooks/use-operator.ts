import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useStudents() {
  return useQuery({
    queryKey: ["operator-students"],
    queryFn: () => apiFetch<any[]>("/operator/students"),
  });
}

export function useRegisterStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/operator/students", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-students"] }),
  });
}

export function useBulkRegisterStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { csv: string }) => apiFetch("/operator/students/bulk", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-students"] }),
  });
}

export function useOperatorAssignments() {
  // Since there isn't a direct GET /operator/assignments endpoint in the spec,
  // we'll infer it from the progress or use admin endpoints if available.
  // Actually, students endpoint returns assigned students.
  // Let's implement what's available.
  return useQuery({
    queryKey: ["operator-progress"],
    queryFn: () => apiFetch<any[]>("/operator/progress"),
  });
}

export function useAssignBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/operator/assignments", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-progress"] }),
  });
}

export function useBulkAssignBooks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/operator/assignments/bulk", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-progress"] }),
  });
}

export function useUnassignBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/operator/assignments/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-progress"] }),
  });
}

export function useBulkUnassignBooks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/operator/assignments/bulk-unassign", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-progress"] }),
  });
}

export function useReadingProgress(studentId?: number) {
  return useQuery({
    queryKey: ["operator-progress", studentId],
    queryFn: () => {
      const url = studentId ? `/operator/progress?studentId=${studentId}` : "/operator/progress";
      return apiFetch<any[]>(url);
    },
  });
}
