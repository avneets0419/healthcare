"use client";

import { MedicalRecord } from "./HistoryModal";
import { Button } from "@/components/ui/button";
import { CalendarDays, Stethoscope, Pill, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HistoryCardProps {
  record: MedicalRecord;
  onViewDetails: (record: MedicalRecord) => void;
}

export function HistoryCard({ record, onViewDetails }: HistoryCardProps) {
  const dateObj = new Date(record.date);

  return (
    <div className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-400/30 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-semibold text-lg text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-colors shrink-0">
            {record.doctorName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate tracking-tight uppercase">
              {record.doctorName}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mt-0.5">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-0 px-3 py-1 rounded-full font-semibold text-[10px] uppercase tracking-widest bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      </div>

      <div className="flex-1 space-y-4">
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-4 w-4 text-emerald-500" />
            <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Diagnosis</h4>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {record.diagnosis}
          </p>
        </div>

        {record.medicines && record.medicines.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Pill className="h-4 w-4 text-emerald-500" />
              <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Medicines</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {record.medicines.slice(0, 3).map((med, idx) => (
                <span key={idx} className="inline-flex px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {med.name}
                </span>
              ))}
              {record.medicines.length > 3 && (
                <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-500">
                  +{record.medicines.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 mt-auto">
        <Button
          onClick={() => onViewDetails(record)}
          variant="outline"
          className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 hover:border-emerald-200 font-bold transition-all text-xs uppercase tracking-widest"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
