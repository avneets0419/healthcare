"use client"

import { Users, DollarSign, TrendingUp, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminDashboardService, DashboardStats } from "@/services/adminDashboard.service";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traffic, setTraffic] = useState<number[]>([40, 60, 45, 95, 65, 80, 50]);

  useEffect(() => {
    adminDashboardService.getTraffic().then(setTraffic).catch(() => { });
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminDashboardService.getStats();
        setStats(data);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6 text-emerald-600 font-bold">Loading Mediso Control Center...</div>;
  if (error) return <div className="p-6 text-rose-500 font-bold">{error}</div>;
  if (!stats) return null;

  const max = Math.max(...traffic);
  const normalize = (val: number) => max === 0 ? 0 : Math.round((val / max) * 100);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-[1600px] mx-auto pb-12">

        {/* 1. Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 relative z-10">
              Control Center
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl relative z-10">
              Real-time analytics, hospital throughput, and high-priority administrative tasks.
            </p>
          </div>
        </div>

        {/* 2. KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* Primary Card: Revenue */}
          <div className="xl:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 dark:from-emerald-800 dark:to-slate-950 p-8 rounded-3xl flex flex-col justify-between text-white shadow-2xl shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 hover:-translate-y-1 duration-500 group border border-emerald-500/50">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute -right-4 -bottom-12 opacity-5 mix-blend-overlay group-hover:scale-110 group-hover:-rotate-6 transition-all duration-1000 pointer-events-none">
              <DollarSign className="w-80 h-80" strokeWidth={3} />
            </div>

            <div className="relative z-10 flex items-center justify-between mb-12">
              <h3 className="font-bold text-emerald-50 text-lg flex items-center gap-3 tracking-tight">
                <span className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                  <DollarSign className="h-5 w-5 text-emerald-100" />
                </span>
                Gross Revenue
              </h3>
              <span className="bg-white/10 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md shadow-inner border border-white/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Month
              </span>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-6xl font-black mb-3 tracking-tighter drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-100">₹ {(stats.totalRevenue ?? 0).toLocaleString('en-IN')}</p>
                <div className="flex items-center text-xs font-bold text-emerald-50 bg-black/20 w-max px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  <span>+12.5% projected vs last month</span>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="hidden sm:flex items-end gap-1.5 h-16 opacity-80">
                {[30, 45, 25, 60, 80, 50, 95].map((val, i) => (
                  <div key={i} className="w-2.5 bg-white/20 rounded-full hover:bg-white/80 transition-all cursor-pointer" style={{ height: `${val}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Card: Total Patients */}
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
            <div className="relative z-10">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs mb-1">Total Patients</h3>
              <div className="flex items-end gap-3 mb-2">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{(stats.totalPatients ?? 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Secondary Card: Active Doctors */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all hover:-translate-y-1 hover:shadow-xl duration-500 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-colors pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
                  <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs mb-1">Active Doctors</h3>
              <div className="flex items-end gap-3 mb-2">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{(stats.activeDoctors ?? 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Chart + Timeline Row */}
        <div className="grid gap-6 lg:grid-cols-12 pt-2">

          {/* Traffic Density Chart */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-8 flex flex-col shadow-lg shadow-slate-200/30 transition-all">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Traffic Density</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Weekly Output Data</p>
              </div>
              <select className="h-10 px-2 text-sm font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl focus:ring-emerald-500/30 focus:border-emerald-500 outline-none cursor-pointer shadow-sm transition-shadow hover:shadow-md">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>

            {/* Chart with Y-axis, bars, X-axis */}
            <div className="flex mt-2 pt-6 relative">

              {/* Y-Axis */}
              <div className="flex flex-col justify-between items-end pr-4 border-r border-slate-100 dark:border-slate-700 pb-8 shrink-0 w-12 z-20">
                <span className="text-[10px] font-bold text-slate-400">100</span>
                <span className="text-[10px] font-bold text-slate-400">75</span>
                <span className="text-[10px] font-bold text-slate-400">50</span>
                <span className="text-[10px] font-bold text-slate-400">25</span>
                <span className="text-[10px] font-bold text-slate-400">0</span>
              </div>

              <div className="absolute -left-12 top-1/2 -rotate-90 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                Patient Volume
              </div>

              <div className="flex-1 flex items-end justify-around relative pl-2 pb-8 h-64">
                {traffic.map((h, i) => {
                  const isPeak = h === max;
                  const heightPct = normalize(h);
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 w-full group cursor-crosshair relative z-10 h-full justify-end">
                      <div className={`w-3/4 relative rounded-md flex items-end overflow-hidden transition-all duration-500 h-full ${isPeak ? 'bg-emerald-50 max-w-[48px]' : 'bg-slate-50 max-w-[40px]'}`}>
                        <div
                          className={`w-full rounded-t-md transition-all duration-700 relative ${isPeak ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-slate-300 group-hover:bg-emerald-400"}`}
                          style={{ height: `${heightPct}%` }}
                        >
                          <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] py-1 px-2 rounded-lg whitespace-nowrap transition-all shadow-xl z-20 font-bold scale-90 group-hover:scale-100 pointer-events-none">
                            {h}
                          </div>
                        </div>
                      </div>

                      {/* X-Axis Label */}
                      <span className="absolute -bottom-6 text-[10px] font-black text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-wider">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>

                      {isPeak && (
                        <span className="absolute -top-6 text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">PEAK</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Pipeline / Timeline */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/50 rounded-3xl p-8 shadow-lg shadow-slate-200/30 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50 relative z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Pipeline</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Next 4 Hours</p>
              </div>
            </div>

            <div className="relative pl-6 space-y-8 pb-4 z-10">
              {/* Vertical timeline connector */}
              <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 z-0" />

              {stats.upcomingAppointments.map((patient) => (
                <div key={patient.id} className="relative group cursor-pointer z-10">
                  {/* Timeline node */}
                  <div className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white border-slate-300 group-hover:border-emerald-400 transition-colors" />

                  <div className="flex flex-col p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-slate-100 group-hover:text-emerald-700">
                          {patient.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{patient.patientName}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">{patient.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex flex-col`}>
                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">{new Date(patient.time).toLocaleTimeString('en-IN', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }).toUpperCase()}</span>

                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">{new Date(patient.time).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}