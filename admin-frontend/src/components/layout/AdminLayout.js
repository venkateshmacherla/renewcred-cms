/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { clearCredentials } from "@/features/auth/authSlice";
import AuthGuard from "@/components/auth/AuthGuard";

import "./admin-layout.css";

export default function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [admin, setAdmin] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedAdmin = localStorage.getItem("admin");

    if (!token || !savedAdmin) {
      router.replace("/login");
      return;
    }

    try {
      setAdmin(JSON.parse(savedAdmin));
      setCheckingAuth(false);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");

      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");

    dispatch(clearCredentials());

    router.replace("/login");
  };

  if (checkingAuth) {
    return (
      <div className="auth-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo">R</div>

            <div>
              <h2>RenewCred</h2>
              <span>CMS Admin</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link
              href="/dashboard"
              className={pathname === "/dashboard" ? "active" : ""}
            >
              Dashboard
            </Link>

            <Link
              href="/pages"
              className={pathname.startsWith("/pages") ? "active" : ""}
            >
              Pages
            </Link>
          </nav>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <div>
              <strong>{admin?.name || "Administrator"}</strong>

              <span>{admin?.email}</span>
            </div>
          </header>

          <main className="admin-content">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
