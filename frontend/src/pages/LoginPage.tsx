import { AuthPageShell } from "@/components/common/AuthPageShell";
import { SectionDivider } from "@/components/common/SectionDivider";
import { AuthTabStrip } from "@/features/auth/components/AuthTabStrip";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Sign in to HireSense AI"
      description="Access your resume, interview prep, and Daily DSA streak."
      tabs={<AuthTabStrip />}
    >
      <div className="space-y-4">
        <LoginForm />
        <div className="relative">
          <SectionDivider className="my-0" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>
        <GoogleSignInButton mode="login" />
      </div>
    </AuthPageShell>
  );
}
