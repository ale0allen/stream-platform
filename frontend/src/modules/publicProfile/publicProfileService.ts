import { apiRequest } from "../../services/api";
import type { StreamAccountSummary } from "../../services/types";

export interface PublicProfile {
  profileId: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  streamAccounts: StreamAccountSummary[];
}

export function getPublicProfile(username: string) {
  return apiRequest<PublicProfile>(`/public/profile/${encodeURIComponent(username)}`);
}
