"use client";

import { useEffect, useState, useCallback } from "react";
import { patientAppointmentService, PatientAppointment } from "@/services/patient/patientAppointment.service";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import { Button } from "@/components/ui/button";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "completed">("all");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientAppointmentService.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await patientAppointmentService.cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    } finally {
      setCancelling(null);
    }
  };

  const filtered = appointments.filter((a) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "upcoming") return a.status === "upcoming" || a.status === "active";
    if (activeFilter === "completed") return a.status === "completed";
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative">
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white relative z-10">
            My Appointments
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest relative z-10">
            View and manage your bookings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/patient/doctors">
            <Button className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { label: "All", value: "all" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Completed", value: "completed" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value as "all" | "upcoming" | "completed")}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 border ${activeFilter === f.value
              ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:border-white"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Showing <strong className="text-slate-600 dark:text-slate-300">{filtered.length}</strong> appointments
      </p>

      {/* 3. Appointment List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <CalendarDays className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest">No appointments found</p>
          </div>
        ) : (
          filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onCancel={handleCancel}
              isLoading={cancelling === appt.id}
            />
          ))
        )}
      </div>
    </div>
  );
}