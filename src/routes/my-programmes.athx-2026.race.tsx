import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/athx-2026/race")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/race", search });
  },
});
