import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus")({
  component: () => <Outlet />,
});