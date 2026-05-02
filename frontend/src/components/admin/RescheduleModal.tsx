"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, User, Loader2, ArrowRight } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { adminAppointmentService } from "@/services/admin-appointment.service";
import { toast } from "sonner";

const rescheduleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: any;
}

export function RescheduleModal({
  isOpen,
  onClose,
  onSuccess,
  appointment,
}: RescheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: "",
      time: "",
    },
  });

  const selectedTime = watch("time");
  const selectedDate = useWatch({ control, name: "date" });

  useEffect(() => {
    if (isOpen && appointment) {
      fetchSlots(appointment.doctorId);
      // Pre-fill with current appointment date/time if possible
      if (appointment.time && appointment.time.includes('T')) {
          const [d, t] = appointment.time.split('T');
          setValue("date", d);
          // Don't auto-set time to allow fresh slot selection
      }
    }
  }, [isOpen, appointment]);

  const fetchSlots = async (doctorId: string) => {
    setFetchingSlots(true);
    try {
      const data = await adminService.getDoctorAvailability(doctorId);
      setAvailabilitySlots(data);
    } catch (error) {
      console.error("Failed to fetch slots");
    } finally {
      setFetchingSlots(false);
    }
  };

  const availableTimesForDate = availabilitySlots.filter(s => 
    s.date === selectedDate && 
    s.status === "available" && 
    (!s.isBooked || (appointment && appointment.time === `${s.date}T${s.startTime}`))
  );

  const onSubmit = async (data: RescheduleFormValues) => {
    setLoading(true);
    try {
      const appointmentTime = `${data.date}T${data.time}`;
      await adminAppointmentService.rescheduleAppointment(appointment.id, appointmentTime);
      toast.success("Appointment rescheduled successfully");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#f8fcfb] dark:bg-slate-900 border-none rounded-[40px] shadow-2xl overflow-hidden p-0">
        <DialogHeader className="px-10 pt-8 pb-8 bg-emerald-600 text-white relative">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/30">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">
                Reschedule
              </DialogTitle>
              <p className="text-[9px] font-black text-emerald-50/80 uppercase tracking-[0.25em] mt-1">
                Moving {appointment.patientName}'s Slot
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-10 py-8 space-y-6">
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{appointment.doctorName}</p>
              </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <CalendarIcon className="h-2.5 w-2.5" /> 1. Select New Date
              </Label>
              <Input
                type="date"
                className="h-12 rounded-2xl border-2 font-bold text-sm px-4 focus:border-emerald-500"
                {...register("date")}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Clock className="h-2.5 w-2.5" /> 2. Choose New Time
              </Label>
              {fetchingSlots ? (
                <div className="h-12 flex items-center gap-2 px-4 bg-slate-50 rounded-2xl animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">Fetching available slots...</span>
                </div>
              ) : !selectedDate ? (
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 italic">
                  Select a date first
                </div>
              ) : availableTimesForDate.length === 0 ? (
                <div className="h-12 flex items-center px-4 bg-rose-50 rounded-2xl text-[10px] font-bold text-rose-400 italic">
                  No slots set for this date
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableTimesForDate.map((slot: any) => {
                    const isCurrent = appointment && appointment.time === `${slot.date}T${slot.startTime}`;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setValue("time", slot.startTime)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedTime === slot.startTime ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" : isCurrent ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200"}`}
                      >
                        {slot.startTime} {isCurrent && "(Current)"}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.time && <p className="text-[10px] font-bold text-red-500">{errors.time.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400">Cancel</Button>
            <Button type="submit" disabled={loading || !selectedTime} className="h-12 px-8 flex-1 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="flex items-center gap-2">Update Schedule <ArrowRight className="h-4 w-4" /></span>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
