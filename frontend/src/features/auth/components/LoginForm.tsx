import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { InputField } from "@/components/common/InputField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/api/apiError";
import { ROUTES } from "@/routes/routePaths";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schemas";

export function LoginForm() {
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values);
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
      <div className="space-y-1">
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="text-left">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
      {loginMutation.isError && (
        <p className="text-sm text-destructive" role="alert">
          {isApiError(loginMutation.error) ? loginMutation.error.message : "Something went wrong."}
        </p>
      )}
      <Button type="submit" className="w-full gap-2" disabled={loginMutation.isPending}>
        {loginMutation.isPending && <Spinner size="sm" className="text-primary-foreground" />}
        {loginMutation.isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
