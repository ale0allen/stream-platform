import { apiRequest } from "../../services/api";
import type { CreatorMetricsResponse } from "../../services/types";

export function getCreatorMetrics(token: string) {
  return apiRequest<CreatorMetricsResponse>("/profiles/metrics", { token });
}

