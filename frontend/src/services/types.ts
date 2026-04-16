export type Role = "ADMIN" | "USER";

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  role: Role;
}

export interface UserSummary {
  id: string;
  email: string;
  username: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  streamAccounts: StreamAccountSummary[];
  createdAt: string;
  updatedAt: string;
}

export type StreamPlatformType = "TWITCH" | "YOUTUBE" | "KICK" | "OTHER";

export type StreamAccountConnectionType = "MANUAL" | "OAUTH";

export interface StreamAccountSummary {
  id: string;
  platform: StreamPlatformType;
  platformUsername: string;
  channelUrl: string;
  connectionType: StreamAccountConnectionType;
}

export interface Favorite {
  id: string;
  profileId: string;
  createdAt: string;
  profile: Profile;
}

export interface DiscoveryProfilesResponse {
  items: Profile[];
  totalCount: number;
  page: number;
  size: number;
}

export interface DiscoveryHighlightsResponse {
  featured: Profile[];
  recent: Profile[];
  complete: Profile[];
}

export interface CreatorMetricsResponse {
  totalCreators: number;
  completeProfiles: number;
  linkedAccounts: number;
}
