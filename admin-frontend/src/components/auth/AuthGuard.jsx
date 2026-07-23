"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/services/api";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("admin");
        router.replace("/login");
        return;
      }

      try {
        await apiRequest("/auth/me");

        if (active) {
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        if (active) {
          setIsAuthenticated(false);
        }

        router.replace("/login");
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [router]);

  // Do NOT render Dashboard/Pages until authentication succeeds
  if (!isAuthenticated) {
    return (
      <div className="auth-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return children;
}
