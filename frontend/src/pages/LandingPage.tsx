import { ArrowRight, Briefcase, FileText, Flame, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/common/Brand";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/routePaths";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Resume Analysis",
    description: "Get detailed, actionable feedback on your resume, scored across every dimension that matters.",
  },
  {
    icon: Briefcase,
    title: "Smart Job Matching",
    description: "Compare your resume against any job description and see exactly where you stand.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sidebar text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Brand tone="on-dark" />
          <div className="flex items-center gap-4">
            <Link to={ROUTES.LOGIN} className="text-sm text-white/70 transition-colors hover:text-white">
              Sign In
            </Link>
            <Button asChild size="sm" className="bg-white text-sidebar hover:bg-white/90">
              <Link to={ROUTES.REGISTER}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-20 pb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">AI-Powered Career Growth</h1>
        <p className="mb-8 max-w-md text-base text-white/60">
          Analyze your resume, improve your skills, challenge peers, and land your dream job.
        </p>
        <Button asChild size="lg" className="gap-2 bg-white text-sidebar hover:bg-white/90">
          <Link to={ROUTES.REGISTER}>
            Get Started
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <Flame className="size-3.5" aria-hidden="true" />
              Our flagship feature
            </div>
            <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">Daily DSA Practice</h2>
            <p className="mb-4 text-white/60">
              A fresh, hand-picked coding problem every day. Build a solving streak, track your progress, and
              stay consistent — the single habit that moves the needle most in technical interviews.
            </p>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              Get a new problem every day, delivered to your inbox.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Today's Problem</span>
              <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white">
                <Flame className="size-3.5 text-warning" aria-hidden="true" />
                12d
              </span>
            </div>
            <p className="mb-2 font-semibold text-white">Longest Increasing Subsequence</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                Medium
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/70">
                Dynamic Programming
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-white/10 p-6">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-white/10">
                <feature.icon className="size-5 text-white" aria-hidden="true" />
              </div>
              <p className="mb-1.5 font-semibold text-white">{feature.title}</p>
              <p className="text-sm text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 sm:flex-row sm:justify-between">
          <Brand tone="on-dark" size="sm" />
          <p className="text-xs text-white/50">© 2026 HireSense AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
