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

export interface StreamAccountSummary {
  id: string;
  platform: StreamPlatformType;
  platformUsername: string;
  channelUrl: string;
}

export interface Favorite {
  id: string;
  profileId: string;
  createdAt: string;
  profile: Profile;
}
