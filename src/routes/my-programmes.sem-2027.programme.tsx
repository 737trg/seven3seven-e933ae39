import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/sem-2027/programme")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Outlet />,
});