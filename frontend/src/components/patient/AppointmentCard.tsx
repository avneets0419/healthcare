"use client";

import { PatientAppointment } from "@/types/appointment.types";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppointmentCardProps {
  appointment: PatientAppointment;
  onCancel: (id: string) => void;
  isLoading?: boolean;
}

const statusStyles: Record<string, string> = {
  upcoming: "bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/50",
  active: "bg-amber-100/50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200/50",
  completed: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200/50",
  cancelled: "bg-rose-100/50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200/50",
};

export function AppointmentCard({ appointment, onCancel, isLoading }: AppointmentCardProps) {
  const doctorName = appointment.doctor?.name || appointment.doctorName || "Unknown Doctor";
  const dateObj = appointment.timeSlot ? new Date(appointment.timeSlot) : null;
  const isPast = dateObj ? dateObj.getTime() < Date.now() : true;
  const canCancel = appointment.status === "upcoming" || appointment.status === "active";
  console.log("Rendering AppointmentCard for:", appointment.id, "Status:", appointment.status, "Can Cancel:", canCancel);

  return (
    <div className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-400/30 backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-semibold text-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 dark:group-hover:bg-blue-900/20 transition-colors shrink-0">
          {(doctorName.replace("Dr. ", "").charAt(0) || "?").toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white truncate tracking-tight mb-1">
            {doctorName}
          </h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            {appointment.doctor?.specialization ?? appointment.type ?? ""}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {dateObj ? (
              <>
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{appointment.time}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex md:justify-center shrink-0">
        <Badge
          variant="outline"
          className={`border-0 px-4 py-1 rounded-full font-semibold text-[10px] uppercase tracking-widest ${statusStyles[appointment.status] ?? ""}`}
        >
          {appointment.status}
        </Badge>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {canCancel && (
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-semibold text-[10px] uppercase tracking-widest transition"
            onClick={() => { onCancel(appointment.id); console.log("Cancel clicked for appointment ID:", appointment.id); }}
            disabled={isLoading || isPast}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-3 w-3 mr-2" />
            )}
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}