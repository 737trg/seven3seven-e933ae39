import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/shell/Sidebar";
import { BottomNav } from "@/components/shell/BottomNav";
import { MobileHeader } from "@/components/shell/MobileHeader";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileHeader />
        <main className="flex-1 pb-24 lg:pb-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}