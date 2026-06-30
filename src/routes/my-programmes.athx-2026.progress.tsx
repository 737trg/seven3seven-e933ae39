import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/athx-2026/progress")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/progress", search });
  },
});
