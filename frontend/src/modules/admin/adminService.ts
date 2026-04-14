import { apiRequest } from "../../services/api";
import type { UserSummary } from "../../services/types";

export function listUsers(token: string) {
  return apiRequest<UserSummary[]>("/admin/users", { token });
}

export function updateUserStatus(token: string, userId: string, active: boolean) {
  return apiRequest<UserSummary>(`/admin/users/${userId}/status`, {
    method: "PUT",
    token,
    body: JSON.stringify({ active })
  });
}
