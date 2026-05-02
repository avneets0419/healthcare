"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient.types";
import {
  User,
  Mail,
  Phone,
  IdCard,
  Calendar,
  Dna,
  Building2,
  Activity,
  Clock,
  HeartPulse,
  Trash2,
  Edit2
} from "lucide-react";

interface ViewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export function ViewPatientModal({
  isOpen,
  onClose,
  patient,
  onEdit,
  onDelete,
}: ViewPatientModalProps) {
  if (!patient) return null;

  const DetailItem = ({ icon: Icon, label, value, color }: any) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200 group">
      <div className={`p-2.5 rounded-xl ${color || "bg-slate-100 dark:bg-slate-800"} shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
          {label}
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
          {value || "N/A"}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-2xl overflow-hidden p-0 gap-0">
        {/* Header Section */}
        <div className="relative h-36 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* Avatar Positioned on the Edge */}
          <div className="absolute -bottom-12 left-8">
            <div className="p-1.5 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
              <div className="h-24 w-24 rounded-[22px] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center border-4 border-white dark:border-slate-900 overflow-hidden">
                <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter">
                  {patient.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 pt-16 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {patient.name}
              </h2>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <IdCard className="h-3.5 w-3.5" />
                <span>Patient ID: {patient.patientId || "N/A"}</span>
              </div>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-sm border ${patient.status?.toLowerCase() === "active"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
              : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${patient.status?.toLowerCase() === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {patient.status?.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem
              icon={Mail}
              label="Email Address"
              value={patient.email}
              color="bg-blue-50 dark:bg-blue-900/20"
            />
            <DetailItem
              icon={Phone}
              label="Phone Number"
              value={patient.phone}
              color="bg-indigo-50 dark:bg-indigo-900/20"
            />
            <DetailItem
              icon={Calendar}
              label="Age"
              value={`${patient.age || "?"} Years`}
              color="bg-amber-50 dark:bg-amber-900/20"
            />
            <DetailItem
              icon={Dna}
              label="Gender"
              value={patient.gender}
              color="bg-rose-50 dark:bg-rose-900/20"
            />
            <DetailItem
              icon={Building2}
              label="Department"
              value={patient.department}
              color="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <DetailItem
              icon={HeartPulse}
              label="Medical Condition"
              value={patient.condition}
              color="bg-teal-50 dark:bg-teal-900/20"
            />
            <div className="col-span-2">
              <DetailItem
                icon={Clock}
                label="Registration Date"
                value={new Date(patient.createdAt).toLocaleDateString("en-US", {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                color="bg-slate-100 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50/50 dark:bg-slate-800/30 px-8 py-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center sm:justify-between">

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold shadow-sm"
            >
              Close
            </Button>

          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
