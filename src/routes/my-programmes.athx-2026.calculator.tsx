import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-programmes/athx-2026/calculator")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/calculator", search });
  },
});
