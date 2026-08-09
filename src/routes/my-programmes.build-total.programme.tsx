import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/build-total/programme")({
  component: () => <Outlet />,
});