import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/sem-2026")({
  component: () => <Outlet />,
});