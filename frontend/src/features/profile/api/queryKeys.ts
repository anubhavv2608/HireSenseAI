import type { SearchStudentsQuery } from "../types/profile.types";

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  public: (userId: string) => [...profileKeys.all, "public", userId] as const,
  publicByUsername: (username: string) => [...profileKeys.all, "public", "username", username] as const,
  search: (query?: SearchStudentsQuery) => [...profileKeys.all, "search", query ?? {}] as const,
};
