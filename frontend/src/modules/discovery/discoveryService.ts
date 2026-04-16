import { apiRequest } from "../../services/api";
import type { DiscoveryProfilesResponse } from "../../services/types";
import type { StreamPlatformType } from "../../services/types";

export type DiscoverySortKey = "recent" | "name_asc" | "name_desc" | "complete";

export interface ListDiscoveryProfilesParams {
  query: string;
  platform: "ALL" | Extract<StreamPlatformType, "TWITCH" | "YOUTUBE" | "KICK">;
  sort: DiscoverySortKey;
  page: number; // 1-based
  size: number;
}

export function listProfiles(token: string, params: ListDiscoveryProfilesParams) {
  const search = params.query.trim();
  const searchParams = new URLSearchParams();

  if (search) searchParams.set("q", search);
  if (params.platform !== "ALL") searchParams.set("platform", params.platform);

  searchParams.set("sort", params.sort);
  searchParams.set("page", String(params.page));
  searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  const path = `/profiles/discovery?${query}`;

  return apiRequest<DiscoveryProfilesResponse>(path, { token });
}
