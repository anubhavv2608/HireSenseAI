import { useSearchParams } from "react-router-dom";
import { AuthPageShell } from "@/components/common/AuthPageShell";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";

  return (
    <AuthPageShell title="Reset your password" description="Paste your reset token and choose a new password.">
      <ResetPasswordForm defaultToken={tokenFromQuery} />
    </AuthPageShell>
  );
}
