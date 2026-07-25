import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/common/InputField";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/api/apiError";
import { useForgotPasswordMutation } from "../hooks/usePasswordResetMutations";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/auth.schemas";

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    await forgotPasswordMutation.mutateAsync(values);
    onSuccess();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <InputField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      {forgotPasswordMutation.isError && (
        <p className="text-sm text-destructive" role="alert">
          {isApiError(forgotPasswordMutation.error)
            ? forgotPasswordMutation.error.message
            : "Something went wrong."}
        </p>
      )}
      <Button type="submit" className="w-full gap-2" disabled={forgotPasswordMutation.isPending}>
        {forgotPasswordMutation.isPending && <Spinner size="sm" className="text-primary-foreground" />}
        {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
