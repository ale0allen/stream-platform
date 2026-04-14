import { apiRequest } from "../../services/api";
import type { Profile } from "../../services/types";

export function listProfiles(token: string, query: string) {
  const search = query.trim();
  const path = search ? `/profiles?q=${encodeURIComponent(search)}` : "/profiles";

  return apiRequest<Profile[]>(path, { token });
}
