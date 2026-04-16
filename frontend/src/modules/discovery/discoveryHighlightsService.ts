import { apiRequest } from "../../services/api";
import type { DiscoveryHighlightsResponse } from "../../services/types";

export function getDiscoveryHighlights(token: string, limit = 6) {
  const safeLimit = Math.min(Math.max(limit, 1), 12);
  return apiRequest<DiscoveryHighlightsResponse>(`/profiles/highlights?limit=${safeLimit}`, { token });
}

