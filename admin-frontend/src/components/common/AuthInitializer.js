"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/features/auth/authSlice";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedAdmin = localStorage.getItem("admin");

    if (token && savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin);

        dispatch(
          setCredentials({
            admin,
            token,
          }),
        );
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
      }
    }
  }, [dispatch]);

  return children;
}
