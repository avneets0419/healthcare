"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/shared/AuthGuard";
import { SummaryCard } from "@/components/patient/SummaryCard";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import { Appointment } from "@/types/appointment.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  FileText,
  Bell,
  Stethoscope,
  ArrowRight,
  Plus,
  Loader2,
  CalendarCheck
} from "lucide-react";
import { cancelAppointment } from "@/services/appointment.service";
import { patientDashboardService, PatientDashboardStats } from "@/services/patient/dashboard.service";



export default function PatientDashboardPage() {
  const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await patientDashboardService.getDashboard();
        setStats(data.stats);
        setUpcoming(data.upcomingAppointments as Appointment[]);
      } catch (e) {
        console.error("Failed to fetch dashboard:", e);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AuthGuard allowedRoles={["patient"]}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading dashboard...</p>
        </div>
      </AuthGuard>
    );
  }

  if (error || !stats) {
    return (
      <AuthGuard allowedRoles={["patient"]}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
            {error ?? "Something went wrong."}
          </p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["patient"]}>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-12">
        {/* 1. Page Header */}
        <div className="relative">
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white relative z-10">
            Patient Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest relative z-10">
            Welcome back, manage your health easily
          </p>
        </div>

        {/* 2. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Upcoming Appointments"
            value={stats.upcomingCount}
            icon={CalendarDays}
            colorClass="bg-blue-100 dark:bg-blue-900/40"
            iconColorClass="text-blue-600 dark:text-blue-400"
          />
          <SummaryCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon={CalendarCheck}
            colorClass="bg-emerald-100 dark:bg-emerald-900/40"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            title="Prescriptions"
            value={stats.totalPrescriptions}
            icon={FileText}
            colorClass="bg-amber-100 dark:bg-amber-900/40"
            iconColorClass="text-amber-600 dark:text-amber-400"
          />
          <SummaryCard
            title="Notifications"
            value={stats.unreadNotifications}
            icon={Bell}
            colorClass="bg-rose-100 dark:bg-rose-900/40"
            iconColorClass="text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 3. Upcoming Appointments Section */}
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Upcoming Appointments
                  </h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Your next scheduled visits</p>
                </div>
                <Link href="/patient/appointments">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold text-xs uppercase tracking-widest">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="relative z-10">
                {upcoming.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CalendarDays className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {upcoming.slice(0, 3).map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        onCancel={async (id) => {
                          await cancelAppointment(id);
                          setUpcoming((prev) => prev.filter(a => a.id !== id));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-8">
            {/* 4. Quick Actions */}
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3 relative z-10">
                <Link href="/patient/doctors" className="block">
                  <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 justify-start px-6">
                    <Plus className="mr-3 h-5 w-5" /> Book Appointment
                  </Button>
                </Link>
                <Link href="/patient/doctors" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold justify-start px-6 text-slate-700 dark:text-slate-300">
                    <Stethoscope className="mr-3 h-5 w-5 text-emerald-500" /> View Doctors
                  </Button>
                </Link>
                <Link href="/patient/history" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold justify-start px-6 text-slate-700 dark:text-slate-300">
                    <FileText className="mr-3 h-5 w-5 text-amber-500" /> Medical History
                  </Button>
                </Link>
              </div>
            </div>



          </div>
        </div>
      </div>
    </AuthGuard>
  );
}