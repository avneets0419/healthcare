"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, CalendarClock, AlertTriangle, ArrowRight, Activity, CalendarCheck, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatCard } from "@/components/shared/StatCard"
import { BookAppointmentModal } from "@/components/admin/BookAppointmentModal"
import { RescheduleModal } from "@/components/admin/RescheduleModal"
import { adminAppointmentService } from "@/services/admin-appointment.service"
import { Appointment } from "@/types/appointment.types"
import { toast } from "sonner"

const getPatientAvatarTint = (name: string) => {
  const styles = [
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
    "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
  ];
  return styles[name.charCodeAt(0) % styles.length];
};

export default function AdminAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [selectedApt, setSelectedApt] = useState<any>(null)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const data = await adminAppointmentService.getAllAppointments(searchQuery)

      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const processed = data.map((apt: any) => {
        const aptDate = new Date(apt.time)
        const aptDateStr = aptDate.toISOString().split('T')[0]

        let dateGroup = "Upcoming"
        if (aptDateStr === today) dateGroup = "Today"
        else if (aptDateStr === tomorrowStr) dateGroup = "Tomorrow"

        return {
          ...apt,
          dateGroup,
          time: aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateStr: aptDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          doctorName: apt.doctor?.name || "Unassigned",
          doctorWorkload: "Real-time sync",
          isLive: aptDateStr === today && Math.abs(aptDate.getTime() - now.getTime()) < 3600000
        }
      })

      setAppointments(processed)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, activeFilter])

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await adminAppointmentService.updateStatus(id, status)
      toast.success(`Appointment ${status.toLowerCase()}`)
      fetchAppointments()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    try {
      await adminAppointmentService.deleteAppointment(id)
      toast.success("Appointment cancelled")
      fetchAppointments()
    } catch (error) {
      toast.error("Failed to cancel appointment")
    }
  }

  let filtered = appointments;
  if (activeFilter === "Today") {
    filtered = filtered.filter((a: any) => a.dateGroup === "Today");
  } else if (activeFilter === "Upcoming") {
    filtered = filtered.filter((a: any) => a.dateGroup === "Tomorrow" || a.dateGroup === "Upcoming");
  }

  const grouped = filtered.reduce((acc: Record<string, any[]>, apt: any) => {
    if (!acc[apt.dateGroup]) acc[apt.dateGroup] = [];
    acc[apt.dateGroup].push(apt);
    return acc;
  }, {} as Record<string, typeof appointments>);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Appointment Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Manage time slots, resolve scheduling conflicts, and oversee daily workflows.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm px-5 py-2.5 h-auto"
        >
          <CalendarIcon className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {/* Filtering Bar */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-800/80 p-4 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mr-2 shrink-0">Views</span>
          {["All", "Today", "Upcoming"].map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full h-8 px-4 text-xs font-semibold transition-all ${activeFilter === filter
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none shadow-sm dark:bg-emerald-900/60 dark:text-emerald-300"
                : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by Patient, Doctor, or ID..."
              className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-100/50 border-slate-200/60 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 shadow-inner rounded-xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 font-medium">
              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" /> Jan 20 - Jan 26
            </Button> */}
            {/* <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 shadow-sm hidden sm:flex">
              <Filter className="mr-2 h-4 w-4 text-slate-500" /> Filter
            </Button> */}
          </div>
        </div>
      </div>

      {/* Appointment Grid */}
      <div className="space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Schedule...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-400 font-medium">No appointments found for this selection.</p>
          </div>
        ) : ["Today", "Tomorrow", "Upcoming"].map((groupName) => {
          const groupAppointments = grouped[groupName];
          if (!groupAppointments || groupAppointments.length === 0) return null;

          return (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  {groupName === "Today" && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {groupName}
                </h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{groupAppointments.length} Appointments</span>
              </div>

              <div className="grid gap-4">
                {groupAppointments.map((apt: any) => {
                  const isCompleted = apt.status === "Completed";
                  const isLive = apt.isLive;

                  return (
                    <div
                      key={apt.id}
                      className={`group relative flex flex-col lg:flex-row lg:items-center gap-5 p-4 lg:p-6 rounded-2xl border bg-white dark:bg-slate-800/90 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isCompleted ? "opacity-50 grayscale-[0.2] hover:grayscale-0 hover:opacity-100 bg-slate-50/50 dark:bg-slate-900/50" : "border-slate-100 dark:border-slate-700/50"} ${isLive ? "border-emerald-300 dark:border-emerald-600/50 shadow-emerald-500/10" : ""}`}
                    >
                      {isLive && (
                        <div className="absolute inset-0 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl pointer-events-none" />
                      )}

                      <div className="w-32 shrink-0 flex flex-col relative z-10">
                        <span className={`text-[22px] font-black tracking-tight ${isLive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-100"}`}>{apt.time}</span>
                        {apt.dateStr && <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{apt.dateStr}</span>}
                        {isLive && (
                          <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 py-1 px-2 rounded-md w-max animate-pulse">
                            <Activity className="w-3 h-3" /> Live Now
                          </span>
                        )}
                      </div>

                      <div className="hidden lg:block w-px h-16 bg-slate-100 dark:bg-slate-700/80 mx-2 relative z-10" />

                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <Avatar className={`h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm ${getPatientAvatarTint(apt.patientName)}`}>
                            <AvatarFallback className="font-extrabold text-sm bg-transparent">
                              {apt.patientName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate flex items-center gap-2">
                              {apt.patientName}
                            </h4>
                            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider truncate bg-slate-100 dark:bg-slate-800 w-max px-2 py-0.5 rounded-md">{apt.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm truncate">{apt.doctorName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Available</p>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <p className="text-[11px] text-slate-400 font-semibold">{apt.doctorWorkload}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-32 shrink-0 relative z-10 flex lg:justify-center">
                        <span className={`inline-flex items-center justify-center w-full max-w-[120px] px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-sm border transition-colors ${apt.status === "Scheduled" ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800/50" :
                          apt.status === "Completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50" :
                            apt.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-700/60" :
                              "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50"
                          }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 lg:w-48 xl:w-56 shrink-0 relative z-10">
                        {apt.status !== "Completed" && apt.status !== "Cancelled" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(apt.id, "Completed")}
                              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              Confirm
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedApt(apt); setIsRescheduleOpen(true); }}
                              className="h-9 w-9 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all active:scale-95"
                              title="Reschedule"
                            >
                              <CalendarClock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(apt.id)}
                              className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95"
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAppointments}
      />

      <RescheduleModal
        isOpen={isRescheduleOpen}
        appointment={selectedApt}
        onClose={() => { setIsRescheduleOpen(false); setSelectedApt(null); }}
        onSuccess={fetchAppointments}
      />
    </div>
  )
}
