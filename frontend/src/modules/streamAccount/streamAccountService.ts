import { apiRequest } from "../../services/api";
import type { StreamAccountSummary, StreamPlatformType } from "../../services/types";

export interface CreateStreamAccountInput {
  platform: Exclude<StreamPlatformType, "OTHER">;
  username: string;
  url: string;
}

export function listStreamAccounts(token: string) {
  return apiRequest<StreamAccountSummary[]>("/stream-accounts", { token });
}

export function addStreamAccount(token: string, input: CreateStreamAccountInput) {
  return apiRequest<StreamAccountSummary>("/stream-accounts", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });
}

export function removeStreamAccount(token: string, accountId: string) {
  return apiRequest<void>(`/stream-accounts/${accountId}`, {
    method: "DELETE",
    token
  });
}
