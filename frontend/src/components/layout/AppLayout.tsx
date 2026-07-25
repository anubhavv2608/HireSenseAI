import { useState } from "react";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Brand } from "@/components/common/Brand";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-app-background">
      <Navbar
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-150 lg:block",
            sidebarCollapsed ? "w-16" : "w-56",
          )}
        >
          <div className={cn("flex h-14 items-center border-b border-sidebar-border", sidebarCollapsed ? "justify-center px-2" : "px-4")}>
            <Brand tone="on-dark" size="sm" withWordmark={!sidebarCollapsed} />
          </div>
          <Sidebar collapsed={sidebarCollapsed} />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
          <SheetHeader className="flex-row items-center border-b border-sidebar-border px-4 py-3">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand tone="on-dark" size="sm" withWordmark />
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}
