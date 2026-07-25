import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthPageShell } from "@/components/common/AuthPageShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { ROUTES } from "@/routes/routePaths";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthPageShell
      title="Forgot your password?"
      description="Enter your email and we'll help you reset it."
      footer={
        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {submitted ? (
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a password reset link to it. Check your inbox.
          </p>
        </div>
      ) : (
        <ForgotPasswordForm onSuccess={() => setSubmitted(true)} />
      )}
    </AuthPageShell>
  );
}
