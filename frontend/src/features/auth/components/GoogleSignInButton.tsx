import { useEffect, useRef } from "react";
import { env } from "@/lib/env";
import { toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useGoogleLoginMutation } from "../hooks/useGoogleLoginMutation";
import type { GoogleAuthMode } from "../types/auth.types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")));
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

interface GoogleSignInButtonProps {
  mode: GoogleAuthMode;
}

export function GoogleSignInButton({ mode }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const googleLoginMutation = useGoogleLoginMutation();

  useEffect(() => {
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (response) => {
            googleLoginMutation.mutate(
              { idToken: response.credential, mode },
              {
                onError: (error) => {
                  const description = isApiError(error) ? error.message : undefined;
                  toastError(
                    mode === "signup" ? "Couldn't create account with Google" : "Couldn't sign in with Google",
                    description,
                  );
                },
              },
            );
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "signin_with",
          width: containerRef.current.offsetWidth,
        });
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
    // Initialize once on mount; the mutate function is stable across renders,
    // and `mode` is a static prop for the lifetime of this component (each
    // page mounts it with a fixed mode, never toggles it while mounted).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="flex w-full justify-center" />;
}
