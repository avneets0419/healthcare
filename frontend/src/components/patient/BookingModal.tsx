"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Clock, CheckCircle2, Loader2, X } from "lucide-react";
import type { PatientDoctor, DoctorSlot } from "@/services/patient/doctor.service";

export interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: PatientDoctor | null;
  slots: DoctorSlot[];
  slotsLoading: boolean;
  onConfirm: (slot: DoctorSlot) => Promise<void>;
}

export function BookingModal({ open, onOpenChange, doctor, slots, slotsLoading, onConfirm }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await onConfirm(selectedSlot);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedSlot(null);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    if (loading) return;
    setSuccess(false);
    setSelectedSlot(null);
    onOpenChange(false);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) resetAndClose(); }}>
      <DialogContent className="max-w-md w-full rounded-[28px] p-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden" showCloseButton={false}>
        {success ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Appointment booked successfully</h3>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              You will receive a confirmation shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 via-white to-teal-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
              <div className="flex-1">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-3">
                  Book Appointment
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {doctor.name}
                </h2>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
                  {doctor.specialization}
                </p>
              </div>
              <DialogClose className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0" onClick={resetAndClose}>
                <X className="h-5 w-5 text-slate-500" />
              </DialogClose>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" /> Available Time Slots
                </h4>

                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 text-sm font-semibold text-slate-400 uppercase tracking-widest">
                    No available slots
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        disabled={loading}
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-11 rounded-xl text-xs font-bold transition-all ${selectedSlot?.id === slot.id
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }`}
                      >
                        {slot.startTime} – {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold shadow-lg transition-all active:scale-95 text-sm uppercase tracking-widest"
                disabled={!selectedSlot || loading || slotsLoading}
                onClick={handleConfirm}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Appointment"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}