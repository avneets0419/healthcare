"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
}

export function SummaryCard({ title, value, icon: Icon, colorClass, iconColorClass }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", colorClass)}>
          <Icon className={cn("h-6 w-6", iconColorClass)} />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">{title}</p>
          <h3 className="text-3xl font-semibold text-slate-900 dark:text-white mt-0.5 tracking-tighter">{value}</h3>
        </div>
      </div>
    </div>
  );
}
