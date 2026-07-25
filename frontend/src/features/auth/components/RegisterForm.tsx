import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/common/InputField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/api/apiError";
import { useRegisterMutation } from "../hooks/useRegisterMutation";
import { useRotatingMessage } from "../hooks/useRotatingMessage";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schemas";

const CREATING_ACCOUNT_MESSAGES = ["Creating your account...", "Setting things up...", "Almost ready..."];

export function RegisterForm() {
  const registerMutation = useRegisterMutation();
  const loadingLabel = useRotatingMessage(CREATING_ACCOUNT_MESSAGES, registerMutation.isPending);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values);
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
      <PasswordInput
        label="Password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordInput
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {registerMutation.isError && (
        <p className="text-sm text-destructive" role="alert">
          {isApiError(registerMutation.error) ? registerMutation.error.message : "Something went wrong."}
        </p>
      )}
      <Button type="submit" className="w-full gap-2" disabled={registerMutation.isPending}>
        {registerMutation.isPending && <Spinner size="sm" className="text-primary-foreground" />}
        {registerMutation.isPending ? loadingLabel : "Create account"}
      </Button>
    </form>
  );
}
