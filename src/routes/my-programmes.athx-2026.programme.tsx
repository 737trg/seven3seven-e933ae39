import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/athx-2026/programme")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/programme", search });
  },
});
