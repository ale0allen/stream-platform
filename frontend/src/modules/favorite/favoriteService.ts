import { apiRequest } from "../../services/api";
import type { Favorite } from "../../services/types";

export function addFavorite(token: string, profileId: string) {
  return apiRequest<Favorite>("/favorites", {
    method: "POST",
    token,
    body: JSON.stringify({ profileId })
  });
}

export function listFavorites(token: string) {
  return apiRequest<Favorite[]>("/favorites", { token });
}

export function removeFavorite(token: string, profileId: string) {
  return apiRequest<void>(`/favorites/${profileId}`, {
    method: "DELETE",
    token
  });
}
