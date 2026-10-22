// Thin adapter so the imported pages keep their navigation calls on TanStack Router.
import { Link as TLink, useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Link({ to, className, children }: { to: string; className?: string; children?: ReactNode }) {
  return (
    <TLink to={to as never} className={className}>
      {children}
    </TLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return (to: string) => router.history.push(to);
}

export function useLocation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return { pathname };
}
