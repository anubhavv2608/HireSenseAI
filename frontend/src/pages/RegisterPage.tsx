import { AuthPageShell } from "@/components/common/AuthPageShell";
import { SectionDivider } from "@/components/common/SectionDivider";
import { AuthTabStrip } from "@/features/auth/components/AuthTabStrip";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

export default function RegisterPage() {
  return (
    <AuthPageShell
      title="Create your account"
      description="Start preparing for your next role."
      tabs={<AuthTabStrip />}
    >
      <div className="space-y-4">
        <RegisterForm />
        <div className="relative">
          <SectionDivider className="my-0" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>
        <GoogleSignInButton mode="signup" />
      </div>
    </AuthPageShell>
  );
}
