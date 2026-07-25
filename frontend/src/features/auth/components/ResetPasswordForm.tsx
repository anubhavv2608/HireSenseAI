import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { InputField } from "@/components/common/InputField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { ROUTES } from "@/routes/routePaths";
import { useResetPasswordMutation } from "../hooks/usePasswordResetMutations";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/auth.schemas";

interface ResetPasswordFormProps {
  defaultToken?: string;
}

export function ResetPasswordForm({ defaultToken = "" }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: defaultToken, newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await resetPasswordMutation.mutateAsync(values);
    toastSuccess("Password updated", "You can now sign in with your new password.");
    navigate(ROUTES.LOGIN, { replace: true });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <InputField label="Reset token" error={errors.token?.message} {...register("token")} />
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <PasswordInput
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmNewPassword?.message}
        {...register("confirmNewPassword")}
      />
      {resetPasswordMutation.isError && (
        <p className="text-sm text-destructive" role="alert">
          {isApiError(resetPasswordMutation.error) ? resetPasswordMutation.error.message : "Something went wrong."}
        </p>
      )}
      <Button type="submit" className="w-full gap-2" disabled={resetPasswordMutation.isPending}>
        {resetPasswordMutation.isPending && <Spinner size="sm" className="text-primary-foreground" />}
        {resetPasswordMutation.isPending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
