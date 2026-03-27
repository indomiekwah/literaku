import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: () => apiFetch<any[]>("/books"),
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/books", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiFetch(`/books/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/books/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useDigitizationRequests() {
  return useQuery({
    queryKey: ["digitization-requests"],
    queryFn: () => apiFetch<any[]>("/digitization-requests"),
  });
}

export function useCreateDigitizationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch("/digitization-requests", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digitization-requests"] }),
  });
}

export function useUpdateDigitizationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiFetch(`/digitization-requests/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digitization-requests"] }),
  });
}
