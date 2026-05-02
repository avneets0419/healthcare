"use client";

import { useEffect, useState } from "react";
import { getDoctorMe, getDoctorStats, setDoctorStatus } from "@/services/doctor.service";
import { getDoctorAppointments } from "@/services/appointment.service";
import { DoctorStats } from "@/types/doctor.types";
import { Appointment } from "@/types/appointment.types";
import { StatCard } from "@/components/shared/StatCard";
import { AppointmentCard } from "@/components/shared/AppointmentCard";
import {
  CalendarDays,
  Clock,
  Users,
  FileText,
  Activity,
  Loader2,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserMinus,
  ChevronRight,
  Plus,
  ArrowUp,
  MoreVertical,
} from "lucide-react";
import AuthGuard from "@/components/shared/AuthGuard";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 p-5 shadow-sm animate-pulse">
      <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
      <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

const MOCK_STATS: DoctorStats = {
  totalAppointments: 128,
  todayAppointments: 6,
  pendingPrescriptions: 3,
  totalPatients: 47,
};

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    patientId: "p1",
    patientName: "Aarav Sharma",
    doctorId: "d1",
    doctorName: "Dr. Smith",
    timeSlot: new Date(Date.now() + 3600_000).toISOString(),
    status: "confirmed",
    notes: "Routine checkup",
  },
  {
    id: "2",
    patientId: "p2",
    patientName: "Priya Nair",
    doctorId: "d1",
    doctorName: "Dr. Smith",
    timeSlot: new Date(Date.now() + 7200_000).toISOString(),
    status: "pending",
  },
  {
    id: "3",
    patientId: "p3",
    patientName: "Rohan Mehta",
    doctorId: "d1",
    doctorName: "Dr. Smith",
    timeSlot: new Date(Date.now() - 3600_000).toISOString(),
    status: "completed",
    notes: "Follow-up for fever",
  },
];

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [me, s, appts] = await Promise.all([
          getDoctorMe(),
          getDoctorStats(),
          getDoctorAppointments(),
        ]);
        setIsActive(me.status === "Active");
        setStats(s);
        setAppointments(appts);
      } catch {
        // Use mock data when API is unavailable
        setStats(MOCK_STATS);
        setAppointments(MOCK_APPOINTMENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleStatus = async () => {
    if (statusSaving) return;
    const next = !isActive;
    setIsActive(next); // optimistic
    setStatusSaving(true);
    try {
      const result = await setDoctorStatus(next);
      setIsActive(result.status === "Active");
    } catch {
      // rollback
      setIsActive(!next);
    } finally {
      setStatusSaving(false);
    }
  };

  const todaysAppts = appointments.filter((a) => {
    const apptDate = new Date(a.timeSlot).toDateString();
    return apptDate === new Date().toDateString();
  });



  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-[1600px] mx-auto pb-12">

        {/* 1. Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 relative z-10">
              Doctor Workspace
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl relative z-10">
              Manage your appointments, availability, and prescriptions efficiently.
            </p>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 p-2 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        onClick={handleToggleStatus}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 leading-none">Status</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Turn off to stop new bookings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Session</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Alert Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-1 shadow-sm flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden transition-all hover:shadow-md hover:border-rose-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
          <div className="flex items-center gap-4 w-full p-3 pl-5">
            <div className="bg-rose-100 dark:bg-rose-900/60 p-2.5 rounded-xl text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6 animate-pulse" strokeWidth={2.5} />
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-rose-900 dark:text-rose-300">
                  {(stats?.pendingPrescriptions ?? 0) > 0
                    ? `You have ${stats?.pendingPrescriptions} pending prescriptions`
                    : "Action Required"
                  }
                </h4>
                <p className="text-sm font-semibold text-rose-700/90 dark:text-rose-400/80 mt-0.5">
                  {(stats?.todayAppointments ?? 0) > 5
                    ? "You are fully booked today. Expect a busy schedule."
                    : "Complete your pending administrative tasks."
                  }
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/doctor/appointments'}
                className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 border-0 font-extrabold active:scale-95 transition-all rounded-xl h-10 px-5 text-xs uppercase tracking-widest flex items-center"
              >
                Review Now &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* 3. KPI Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* Card 1: Today's Appointments (UPDATED UI) */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all hover:-translate-y-1 hover:shadow-xl duration-500 flex flex-col justify-between group relative overflow-hidden">

            <div className="absolute -right-8 -top-8 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl group-hover:bg-teal-400/20 transition-colors pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400/20 blur-md rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-teal-100/50 dark:border-teal-800/30">
                  <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">
                Live
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full mt-2">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] mb-2 text-center">
                Today&apos;s Appointments
              </h3>

              <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {stats?.todayAppointments ?? 0}
              </p>

              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-widest">
                +2 from yesterday
              </span>
            </div>
          </div>

          {/* Card 2: Completed Appointments */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all hover:-translate-y-1 hover:shadow-xl duration-500 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-colors pointer-events-none" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
                  <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative z-10 flex flex-col items-center w-full mt-2">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] mb-2 text-center">Completed Appointments</h3>
              <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-widest">
                Done
              </span>
            </div>
          </div>

          {/* Card 3: Pending Prescriptions */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all hover:-translate-y-1 hover:shadow-xl duration-500 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-colors pointer-events-none" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-md rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-amber-100/50 dark:border-amber-800/30">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              {(stats?.pendingPrescriptions ?? 0) > 0 && (
                <div className="h-3 w-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm animate-bounce" />
              )}
            </div>
            <div className="relative z-10 flex flex-col items-center w-full mt-2">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] mb-2 text-center">Pending Prescriptions</h3>
              <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {stats?.pendingPrescriptions ?? 0}
              </p>
              {(stats?.pendingPrescriptions ?? 0) > 0 ? (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md uppercase tracking-widest">
                  Urgent
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-widest opacity-0">
                  None
                </span>
              )}
            </div>
          </div>

          {/* Card 4: Total Patients */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all hover:-translate-y-1 hover:shadow-xl duration-500 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-sky-400/10 rounded-full blur-3xl group-hover:bg-sky-400/20 transition-colors pointer-events-none" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-400/20 blur-md rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-sky-100/50 dark:border-sky-800/30">
                  <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center w-full mt-2">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] mb-2 text-center">Total Patients Seen</h3>
              <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {stats?.totalPatients ?? 0}
              </p>
              <div className="flex -space-x-2 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Upcoming Appointments Section */}
        <div className="grid gap-6 lg:grid-cols-12 pt-2">

          <div className="lg:col-span-8 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-8 flex flex-col shadow-lg shadow-slate-200/30 transition-all">
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Upcoming Appointments</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Scheduled for today</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-100 dark:bg-teal-900/40 px-3 py-1 text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-widest">
                  {todaysAppts.length} Appointments
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-teal-600 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)}
              </div>
            ) : todaysAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <CalendarDays className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">No more appointments today</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {todaysAppts.map((appt, idx) => {
                  const isNext = idx === 0;
                  return (
                    <div
                      key={appt.id}
                      className={`relative group p-6 rounded-[22px] border transition-all duration-500 overflow-hidden ${isNext
                          ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-teal-400 shadow-xl shadow-teal-500/30 scale-[1.02] z-10'
                          : 'bg-white text-slate-900 border-slate-100 hover:border-slate-200 hover:shadow-md dark:bg-slate-800/50 dark:text-white dark:border-slate-700'
                        }`}
                    >
                      {isNext && (
                        <div className="absolute top-0 right-0 p-4">
                          <span className="bg-teal-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-teal-500/30">
                            Next UP
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border transition-colors ${isNext
                            ? 'bg-white/20 border-white/20 text-white'
                            : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                          }`}>
                          {appt.patientName?.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-black text-base tracking-tight ${isNext ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {appt.patientName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className={`h-3 w-3 ${isNext ? 'text-teal-100' : 'text-slate-400'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isNext ? 'text-teal-50' : 'text-slate-500'}`}>
                              {new Date(appt.timeSlot).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${appt.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                          }`}>
                          {appt.status}
                        </span>
                        <Button
                          size="sm"
                          className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isNext
                              ? 'bg-white hover:bg-teal-50 text-teal-700 shadow-lg shadow-black/10'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                            }`}
                        >
                          Add Prescription <Plus className="ml-1.5 h-3 w-3" strokeWidth={3} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity/Sidebar widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800/90 p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                <Activity className="h-20 w-20 text-slate-900 dark:text-white" />
              </div>
              <h4 className="text-slate-900 dark:text-white font-black text-xl mb-2 relative z-10">Quick Actions</h4>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest mb-8 relative z-10">Streamline your workflow</p>

              <div className="grid grid-cols-1 gap-3 relative z-10">
                <Button variant="outline" onClick={() => window.location.href = '/doctor/availability'} className="justify-start h-12 bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 hover:text-teal-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm shadow-sm">
                  <CalendarDays className="mr-3 h-4 w-4 text-teal-500" /> Update Schedule
                </Button>
                <Button variant="outline" className="justify-start h-12 bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm shadow-sm">
                  <Users className="mr-3 h-4 w-4 text-emerald-500" /> Patient Records
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/doctor/prescriptions'} className="justify-start h-12 bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 hover:text-amber-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm shadow-sm">
                  <FileText className="mr-3 h-4 w-4 text-amber-500" /> Prescriptions
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}