"use client";

import { Button } from "@/components/ui/button";
import type { PatientDoctor } from "@/services/patient/doctor.service";

// Re-export so any file that imports PatientDoctor from DoctorCard still works
export type { PatientDoctor };

interface DoctorCardProps {
  doctor: PatientDoctor;
  onBook: (doctor: PatientDoctor) => void | Promise<void>;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-400/30 backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 group-hover:border-emerald-100 dark:group-hover:bg-emerald-900/20 transition-colors shrink-0 overflow-hidden">
          {doctor.image ? (
            <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
          ) : (
            doctor.name.replace("Dr. ", "").charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight mb-1">
            {doctor.name}
          </h3>
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest">
            {doctor.specialization}
          </span>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {doctor.isAvailable && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${doctor.isAvailable ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {doctor.isAvailable ? "Available" : "Not Available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={() => onBook(doctor)}
          disabled={!doctor.isAvailable}
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}