"use client";

import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Medicine } from "@/types/prescription.types";
import { CalendarDays, Stethoscope, Pill, X, Clock } from "lucide-react";

export interface MedicalRecord {
  id: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medicines: Medicine[];
  status: string;
  notes?: string;
}

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MedicalRecord | null;
}

export function HistoryModal({ open, onOpenChange, record }: HistoryModalProps) {
  if (!record) return null;
  const dateObj = new Date(record.date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full rounded-[28px] p-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden" showCloseButton={false}>
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
          <div className="flex-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold uppercase tracking-widest mb-3">
              Medical Record
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
              {record.doctorName}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-slate-500">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
            </div>
          </div>
          <DialogClose className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0">
            <X className="h-5 w-5 text-slate-500" />
          </DialogClose>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Diagnosis & Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Stethoscope className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Diagnosis & Notes</h3>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {record.diagnosis}
              </p>
              {record.notes && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-4">
                  {record.notes}
                </p>
              )}
            </div>
          </div>

          {/* Prescription Details */}
          {record.medicines && record.medicines.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Pill className="h-5 w-5 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Prescription Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {record.medicines.map((med, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{med.name}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{med.dosage}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs">{med.frequency}</span>
                      <span className="text-xs opacity-70">{med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
