import { useQuery } from "@tanstack/react-query";
import { resumeApi } from "../api/resume.api";
import { resumeKeys } from "../api/queryKeys";
import { isApiError } from "@/api/apiError";

export function useCurrentResume() {
  const query = useQuery({
    queryKey: resumeKeys.current(),
    queryFn: resumeApi.getCurrent,
  });

  const isEmpty = query.isError && isApiError(query.error) && query.error.status === 404;

  return { ...query, isEmpty };
}
