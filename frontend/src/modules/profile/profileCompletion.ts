import type { StreamAccountSummary } from "../../services/types";

export type ProfileCompletionKey = "displayName" | "username" | "bio" | "avatar" | "streamAccounts";

export interface ProfileCompletionInput {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null | undefined;
  streamAccounts: StreamAccountSummary[] | number;
  /**
   * When provided, this overrides the default "username is valid" heuristic.
   * Useful in the profile editor where we know whether the username is available.
   */
  usernameIsValid?: boolean;
}

export interface ProfileCompletionItem {
  key: ProfileCompletionKey;
  complete: boolean;
}

export interface ProfileCompletionResult {
  percent: number;
  completedCount: number;
  totalCount: number;
  items: ProfileCompletionItem[];
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

// Same rule used in the profile editor for the username format.
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

function isUsernameComplete(username: string, usernameIsValid?: boolean) {
  if (usernameIsValid !== undefined) {
    return Boolean(usernameIsValid);
  }

  const normalized = normalizeUsername(username);
  return normalized.length >= 3 && normalized.length <= 30 && USERNAME_PATTERN.test(normalized);
}

export function calculateProfileCompletion(input: ProfileCompletionInput): ProfileCompletionResult {
  const trimmedDisplayName = input.displayName.trim();
  const trimmedUsername = normalizeUsername(input.username);
  const trimmedBio = input.bio.trim();
  const hasAvatar = Boolean(input.avatarUrl && input.avatarUrl.trim());
  const streamAccountCount = typeof input.streamAccounts === "number" ? input.streamAccounts : input.streamAccounts.length;

  const items: ProfileCompletionItem[] = [
    { key: "displayName", complete: trimmedDisplayName.length >= 2 },
    { key: "username", complete: isUsernameComplete(trimmedUsername, input.usernameIsValid) },
    { key: "bio", complete: trimmedBio.length >= 30 },
    { key: "avatar", complete: hasAvatar },
    { key: "streamAccounts", complete: streamAccountCount > 0 }
  ];

  const completedCount = items.filter((item) => item.complete).length;
  const totalCount = items.length;
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return { percent, completedCount, totalCount, items };
}

