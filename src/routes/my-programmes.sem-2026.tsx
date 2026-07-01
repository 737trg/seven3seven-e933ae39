import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/sem-8")({
  component: () => <Outlet />,
});