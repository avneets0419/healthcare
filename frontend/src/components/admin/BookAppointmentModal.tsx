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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, Clock, User, Stethoscope, Loader2, IndianRupee, Briefcase, ChevronRight, Search, CheckCircle } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { patientService } from "@/services/admin-patient.service";
import { adminAppointmentService } from "@/services/admin-appointment.service";
import { Patient } from "@/types/patient.types";
import { Doctor } from "@/types/doctor.types";
import { toast } from "sonner";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select a doctor"),
  type: z.string().min(1, "Please select a domain/specialization"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  price: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

export function BookAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: BookAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: "",
      price: "500",
      time: "",
    },
  });

  const selectedTime = watch("time");

  useEffect(() => {
    loadData();
  }, [isOpen]);

  const selectedDomain = useWatch({ control, name: "type" });
  const selectedDoctorId = useWatch({ control, name: "doctorId" });
  const selectedPatientId = useWatch({ control, name: "patientId" });
  const selectedDate = useWatch({ control, name: "date" });

  useEffect(() => {
    if (selectedDoctorId) {
      fetchSlots(selectedDoctorId);
    } else {
      setAvailabilitySlots([]);
    }
  }, [selectedDoctorId]);

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

  const availableTimesForDate = availabilitySlots.filter(s => s.date === selectedDate && s.status === "available" && !s.isBooked);

  // Handle outside click to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearching) {
        const target = event.target as HTMLElement;
        if (!target.closest(".relative.col-span-2")) {
          setIsSearching(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearching]);

  const loadData = async () => {
    setFetchingData(true);
    try {
      const [patientsData, doctorsData] = await Promise.all([
        patientService.getPatients(),
        adminService.getDoctors(),
      ]);

      const patientsList = Array.isArray(patientsData) ? patientsData : (patientsData as any).patients || [];
      const doctorsList = Array.isArray(doctorsData) ? doctorsData : (doctorsData as any).doctors || [];

      setPatients(patientsList);
      setDoctors(doctorsList);
    } catch (error) {
      console.error("Failed to load patients/doctors:", error);
      toast.error("Network error: Could not fetch records");
    } finally {
      setFetchingData(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      (p.patientId && p.patientId.toLowerCase().includes(s)) ||
      p.email.toLowerCase().includes(s)
    );
  });

  const filteredDoctors = doctors.filter(doc => {
    if (!selectedDomain) return true;
    const domainMap: Record<string, string[]> = {
      "General Checkup": ["General", "Checkup", "Physician"],
      "Cardiology": ["Cardiology", "Cardiologist"],
      "Neurology": ["Neurology", "Neurologist"],
      "Orthopedics": ["Orthopedics", "Orthopedic", "Surgeon"],
      "Dermatology": ["Dermatology", "Dermatologist"],
      "Dental": ["Dental", "Dentist"]
    };

    const specs = domainMap[selectedDomain] || [selectedDomain];
    const docSpec = doc.specialization.toLowerCase();

    return specs.some(s => docSpec.includes(s.toLowerCase())) ||
      docSpec.includes(selectedDomain.toLowerCase()) ||
      selectedDomain.toLowerCase().includes(docSpec);
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    setLoading(true);
    try {
      const appointmentTime = `${data.date}T${data.time}`;

      await adminAppointmentService.createAppointment({
        patientId: data.patientId,
        doctorId: data.doctorId,
        type: data.type,
        time: appointmentTime,
        price: data.price ? parseFloat(data.price) : 0,
        notes: data.notes,
      });

      toast.success("Appointment booked successfully");
      reset();
      setSearchTerm("");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const selectedPatientName = patients.find(p => p.id === selectedPatientId)?.name;
  const selectedDoctorName = doctors.find(d => d.id === selectedDoctorId)?.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] bg-[#f8fcfb] dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[40px] shadow-2xl overflow-hidden p-0 border-none">
        <DialogHeader className="px-10 pt-8 pb-8 bg-emerald-600 text-white relative">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/30">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">
                Book Appointment
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-1 w-1 rounded-full bg-white/60 animate-pulse"></span>
                <p className="text-[9px] font-black text-emerald-50/80 uppercase tracking-[0.25em]">
                  Admin Scheduling Suite
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-10 py-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="type" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Briefcase className="h-2.5 w-2.5" /> Step 1: Specialization
              </Label>
              <Select onValueChange={(v: string | null) => {
                setValue("type", v || "");
                setValue("doctorId", "");
              }}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/50 focus:ring-emerald-500/20 px-5 font-bold text-slate-700 dark:text-slate-200 text-sm transition-all hover:border-emerald-200 shadow-sm border-2">
                  <SelectValue placeholder="Choose a domain..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl p-1.5">
                  {["General Checkup", "Cardiology", "Neurology", "Orthopedics", "Dermatology", "Dental"].map(domain => (
                    <SelectItem key={domain} value={domain} className="rounded-xl py-2 px-3 font-semibold text-xs focus:bg-emerald-50 dark:focus:bg-emerald-900/30">
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="doctorId" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Stethoscope className="h-2.5 w-2.5" /> Step 2: Specialist
              </Label>
              <Select
                disabled={!selectedDomain || fetchingData}
                onValueChange={(v: string | null) => setValue("doctorId", v || "")}
                value={selectedDoctorId}
              >
                <SelectTrigger className={`h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/50 focus:ring-emerald-500/20 px-5 text-sm transition-all hover:border-emerald-200 shadow-sm border-2 ${!selectedDomain ? "opacity-50 cursor-not-allowed" : "font-bold text-slate-700 dark:text-slate-200"}`}>
                  <div className="flex items-center gap-2">
                    {selectedDoctorId && <User className="h-3.5 w-3.5 text-emerald-500" />}
                    <span>{selectedDoctorName || (fetchingData ? "Syncing..." : "Select Specialist")}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 max-h-[250px]">
                  {filteredDoctors.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="rounded-xl py-2 px-3 focus:bg-emerald-50 dark:focus:bg-emerald-900/30">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{d.name}</span>
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">{d.specialization}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 py-1">
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 shrink-0">Patient Verification</span>
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
              </div>
            </div>

            <div className="space-y-2 col-span-2 relative">
              <Label htmlFor="patientSearch" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <User className="h-2.5 w-2.5" /> Step 3: Find Patient
              </Label>
              <div className="relative group">
                <Input
                  id="patientSearch"
                  placeholder="ID or Email..."
                  className={`h-12 pl-12 pr-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/50 focus-visible:ring-emerald-500/20 transition-all font-bold text-sm border-2 shadow-sm ${selectedPatientId && !searchTerm ? "text-emerald-600 border-emerald-200" : ""}`}
                  value={searchTerm || (selectedPatientId ? selectedPatientName : "")}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedPatientId) setValue("patientId", "");
                  }}
                  onFocus={() => setIsSearching(true)}
                />
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? "text-emerald-500" : "text-slate-300"}`} />
                {selectedPatientId && !searchTerm && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
              {isSearching && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto">
                  {filteredPatients.map((p: any) => (
                    <div key={p.id} onClick={() => { setValue("patientId", p.id); setSearchTerm(""); setIsSearching(false); }} className="flex items-center gap-3 p-3 hover:bg-emerald-50 cursor-pointer text-sm">
                      <Avatar className="h-8 w-8 rounded-xl"><AvatarFallback className="bg-emerald-100 text-xs font-bold text-emerald-700">{getInitials(p.name)}</AvatarFallback></Avatar>
                      <div className="flex flex-col"><span className="font-bold text-xs">{p.name}</span><span className="text-[10px] text-slate-500">{p.email}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <CalendarIcon className="h-2.5 w-2.5" /> Date
              </Label>
              <Input
                type="date"
                className="h-12 rounded-2xl border-2 font-bold text-sm px-4 focus:border-emerald-500"
                {...register("date")}
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Clock className="h-2.5 w-2.5" /> Available Slots
              </Label>
              {fetchingSlots ? (
                <div className="h-12 flex items-center gap-2 px-4 bg-slate-50 rounded-2xl animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">Fetching...</span>
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
                  {availableTimesForDate.map((slot: any) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setValue("time", slot.startTime)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border-2 ${selectedTime === slot.startTime ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200"}`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
              {errors.time && <p className="text-[10px] font-bold text-red-500">{errors.time.message}</p>}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <IndianRupee className="h-2.5 w-2.5" /> Fee
              </Label>
              <Input type="number" className="h-12 rounded-2xl border-2 font-black text-emerald-600 text-sm px-4" {...register("price")} />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                 Clinical Notes
              </Label>
              <Input placeholder="Brief notes..." className="h-12 rounded-2xl border-2 font-semibold text-sm px-4" {...register("notes")} />
            </div>
          </div>

          <DialogFooter className="px-10 py-5 border-t border-emerald-100/50 flex items-center gap-4 bg-[#f8fcfb]/50">
            <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400">Cancel</Button>
            <Button type="submit" disabled={loading} className="h-12 px-8 flex-1 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalize Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
