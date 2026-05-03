"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import AuthGuard from "@/components/shared/AuthGuard";
import { decodeToken } from "@/lib/decodeToken";

export default function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState<string>("Admin");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.name) {
        setUserName(decoded.name);
      }
    }
  }, []);

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout role="admin" userName={userName}>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
