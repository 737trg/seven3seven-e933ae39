import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/mixed/programme")({
  component: () => <Outlet />,
});