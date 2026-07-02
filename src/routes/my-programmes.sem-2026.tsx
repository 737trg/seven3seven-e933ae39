import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/sem-2026")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Outlet />,
});