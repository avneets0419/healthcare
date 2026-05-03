"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopHeader } from "./top-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "doctor" | "patient";
  userName?: string;
}

export function DashboardLayout({ children, role, userName = "User" }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <div className="font-sans flex flex-1 flex-col overflow-hidden w-full transition-all duration-300 ease-in-out">
        <TopHeader userName={userName} userRole={role} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
