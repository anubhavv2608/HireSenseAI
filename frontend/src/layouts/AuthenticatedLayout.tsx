import { Outlet } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

export function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
