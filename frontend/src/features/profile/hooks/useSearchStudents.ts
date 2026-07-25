import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "../api/queryKeys";
import type { SearchStudentsQuery } from "../types/profile.types";

export function useSearchStudents(query: SearchStudentsQuery) {
  return useQuery({
    queryKey: profileKeys.search(query),
    queryFn: () => profileApi.searchStudents(query),
  });
}
