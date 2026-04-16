import { apiRequest } from "../../services/api";

export interface OAuthStartResponse {
  authorizeUrl: string;
}

export function startTwitchOAuth(token: string) {
  return apiRequest<OAuthStartResponse>("/stream-accounts/oauth/twitch/start", { token });
}

export function disconnectTwitchOAuth(token: string) {
  return apiRequest<void>("/stream-accounts/oauth/twitch", { method: "DELETE", token });
}

