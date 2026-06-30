import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/athx-2026")({
  beforeLoad: () => {
    throw redirect({ to: "/my-programmes/athx-2026" });
  },
});
