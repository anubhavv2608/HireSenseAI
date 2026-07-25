import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { AuthProvider } from "./AuthProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <AuthProvider>{children}</AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
