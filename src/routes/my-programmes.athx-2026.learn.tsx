import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/athx-2026/learn")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/learn", search });
  },
});
