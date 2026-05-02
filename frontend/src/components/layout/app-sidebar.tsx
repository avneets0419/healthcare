"use client";

import { LayoutDashboard, Users, Calendar, ClipboardList, User, ShieldCheck, Activity, FileText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Example static links. We can pass different lists based on roles (Patient, Doctor, Admin)
const items = {
  admin: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Doctors", url: "/admin/doctors", icon: Users },
    { title: "Patients", url: "/admin/patients", icon: Users },
    { title: "Appointments", url: "/admin/appointments", icon: Calendar },
  ],
  doctor: [
    { title: "Dashboard", url: "/doctor/dashboard", icon: LayoutDashboard },
    { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
    { title: "Availability", url: "/doctor/availability", icon: Activity },
    { title: "Prescriptions", url: "/doctor/prescriptions", icon: FileText },
  ],
  patient: [
    { title: "Dashboard", url: "/patient/dashboard", icon: LayoutDashboard },
    { title: "Doctors", url: "/patient/doctors", icon: Users },
    { title: "Appointments", url: "/patient/appointments", icon: Calendar },
    { title: "Medical History", url: "/patient/history", icon: FileText },
    { title: "Profile", url: "/patient/profile", icon: Settings },
  ],
};

export function AppSidebar({ role }: { role: "admin" | "doctor" | "patient" }) {
  const pathname = usePathname();
  const currentItems = items[role] || items.patient;

  return (
    <Sidebar className="border-r border-emerald-100/50 dark:border-slate-800 bg-[#f8fcfb] dark:bg-slate-950">
      <SidebarHeader className="h-16 px-6 flex justify-center border-b border-emerald-100/50 dark:border-slate-800 bg-[#f8fcfb] dark:bg-slate-950">
        <div className="flex items-center gap-3 font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <span>Mediso</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentItems.map((item) => {
                const isActive = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.url} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? "bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-900/40 dark:text-emerald-300" : "text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"}`} />}
                    >
                      <div className={`flex items-center justify-center transition-colors ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.title}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {/* We can place user profile/settings shorthand here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
