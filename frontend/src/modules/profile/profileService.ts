import { apiRequest } from "../../services/api";
import type { Profile } from "../../services/types";

export function getMyProfile(token: string) {
  return apiRequest<Profile>("/profiles/me", { token });
}

export interface UpdateProfileInput {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

export function updateMyProfile(token: string, input: UpdateProfileInput) {
  return apiRequest<Profile>("/profiles/me", {
    method: "PUT",
    token,
    body: JSON.stringify(input)
  });
}

export interface UsernameAvailability {
  username: string;
  available: boolean;
}

export function checkUsernameAvailability(token: string, username: string) {
  const searchParams = new URLSearchParams({ username });
  return apiRequest<UsernameAvailability>(`/profiles/username-availability?${searchParams.toString()}`, { token });
}
