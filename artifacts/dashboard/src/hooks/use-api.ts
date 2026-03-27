import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, Institution, Operator, Book, Student, DigitizationRequest } from "@/lib/mock-api";
import { useAuth } from "./use-auth";

export function useInstitutions() {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: mockApi.getInstitutions,
  });
}

export function useInstitution(id: string) {
  return useQuery({
    queryKey: ['institutions', id],
    queryFn: () => mockApi.getInstitution(id),
    enabled: !!id,
  });
}

export function useCreateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createInstitution,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['institutions'] }),
  });
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Institution> }) => mockApi.updateInstitution(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['institutions'] }),
  });
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.deleteInstitution,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['institutions'] }),
  });
}

export function useOperators() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: mockApi.getOperators,
  });
}

export function useCreateOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createOperator,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operators'] }),
  });
}

export function useDeleteOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.deleteOperator,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operators'] }),
  });
}

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: mockApi.getBooks,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });
}

export function useStudents(institutionId?: string) {
  const { user } = useAuth();
  const iId = institutionId || user?.institutionId;
  return useQuery({
    queryKey: ['students', iId],
    queryFn: () => mockApi.getStudents(iId),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => mockApi.getStudent(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useReadingReports(studentId: string) {
  return useQuery({
    queryKey: ['reports', studentId],
    queryFn: () => mockApi.getReadingReports(studentId),
    enabled: !!studentId,
  });
}

export function useDigitizationRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['digitization', user?.institutionId],
    queryFn: () => mockApi.getDigitizationRequests(user?.institutionId),
  });
}

export function useCreateDigitizationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createDigitizationRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['digitization'] }),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['stats', 'admin'],
    queryFn: mockApi.getAdminStats,
  });
}

export function useOperatorStats(institutionId: string) {
  return useQuery({
    queryKey: ['stats', 'operator', institutionId],
    queryFn: () => mockApi.getOperatorStats(institutionId),
    enabled: !!institutionId,
  });
}
