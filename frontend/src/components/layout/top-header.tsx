"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, LogOut, Settings, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function TopHeader({ userName, userRole }: { userName: string, userRole: string }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-emerald-100/50 dark:border-slate-800 bg-[#f8fcfb] dark:bg-slate-950 px-6 sticky top-0 z-10 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors" />
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {greeting()}, <span className="font-semibold text-slate-900 dark:text-slate-100">{userName}</span>
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-md hidden md:flex items-center relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        <Input
          type="search"
          placeholder="Search patients, doctors or appointments..."
          className="w-full xl:w-[400px] h-10 bg-slate-50 hover:bg-slate-100 border-slate-200/60 pl-9 dark:bg-slate-800/50 dark:border-slate-700/60 text-sm focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 shadow-inner transition-all rounded-full"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="ml-2 flex h-9 w-9 xl:w-auto xl:px-1 xl:gap-2 cursor-pointer items-center justify-center rounded-full xl:rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8 border border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-105">
              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-teal-800 font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-col items-start pr-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{userName}</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-600/80 leading-none">{userRole}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 border-slate-200 dark:border-slate-800 shadow-xl" align="end">
            <DropdownMenuLabel className="font-normal px-2 py-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs leading-none text-slate-500 capitalize">
                  {userRole} Account
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
              <Settings className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Help &amp; Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:bg-red-50 dark:focus:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-bold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
