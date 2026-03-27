import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "super_admin" | "operator" | "student";
  institutionId: number | null;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["auth-me"],
    queryFn: () => apiFetch<User>("/auth/me"),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const data = await apiFetch<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(["auth-me"], data.user);
      return data;
    },
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.clear();
    window.location.href = import.meta.env.BASE_URL + "login";
  };

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
