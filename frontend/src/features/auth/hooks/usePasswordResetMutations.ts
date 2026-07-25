import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import type { ForgotPasswordPayload, ResetPasswordPayload } from "../types/auth.types";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
  });
}
