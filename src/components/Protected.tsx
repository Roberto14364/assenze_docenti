import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

export function Protected({ children, onlyAdmin = false }: { children: ReactNode; onlyAdmin?: boolean }) {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait one tick so AuthProvider can restore the saved user.
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const stored = localStorage.getItem("currentUser");
    if (!isAuthenticated && !stored) router.history.replace("/login");
    else if (onlyAdmin && currentUser && currentUser.role !== "admin") router.history.replace("/");
  }, [ready, isAuthenticated, currentUser, onlyAdmin, router]);

  if (!ready || !isAuthenticated) return null;
  if (onlyAdmin && currentUser?.role !== "admin") return null;
  return <Layout>{children}</Layout>;
}
