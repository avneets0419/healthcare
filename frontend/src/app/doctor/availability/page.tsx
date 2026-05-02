"use client";

import { useEffect, useState, useCallback } from "react";
import { getDoctorSchedule, addAvailabilitySlot, deleteAvailabilitySlot, updateAvailabilitySlot } from "@/services/doctor.service";
import { AvailabilitySlot } from "@/types/doctor.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  Trash2,
  Plus,
  Edit2,
  Ban,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import AuthGuard from "@/components/shared/AuthGuard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export default function DoctorAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isManual, setIsManual] = useState(false);
  
  const [date, setDate] = useState("");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editState, setEditState] = useState<{
    open: boolean;
    slot: AvailabilitySlot | null;
    date: string;
    startTime: string;
    endTime: string;
    saving: boolean;
  }>({ open: false, slot: null, date: "", startTime: "", endTime: "", saving: false });

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDoctorSchedule();
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    if (!isManual && selectedTimes.length === 0) return;
    if (isManual && (!manualStart || !manualEnd)) return;
    
    setIsAdding(true);
    try {
      if (isManual) {
        const newSlot = await addAvailabilitySlot({ date, startTime: manualStart, endTime: manualEnd });
        setSlots((prev) => [...prev, newSlot].sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()));
        setManualStart("");
        setManualEnd("");
      } else {
        const promises = selectedTimes.map(t => {
          const hour = parseInt(t.split(':')[0]);
          const nextHour = (hour + 1).toString().padStart(2, '0');
          return addAvailabilitySlot({ 
            date, 
            startTime: t, 
            endTime: `${nextHour}:00` 
          });
        });

        const newSlots = await Promise.all(promises);
        setSlots((prev) => [...prev, ...newSlots].sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()));
        setSelectedTimes([]);
      }
      setDate("");
    } catch (err) {
      console.error("Failed to add slots", err);
      fetchSlots();
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTimeSelection = (t: string) => {
    setSelectedTimes(prev => 
      prev.includes(t) ? prev.filter(time => time !== t) : [...prev, t]
    );
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAvailabilitySlot(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete slot", err);
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkUnavailable = async (slot: AvailabilitySlot) => {
    if (slot.isBooked) return;
    const current = slot.status ?? "available";
    const nextStatus = current === "unavailable" ? "available" : "unavailable";
    try {
      const updated = await updateAvailabilitySlot(slot.id, { status: nextStatus });
      setSlots((prev) =>
        prev
          .map((s) => (s.id === updated.id ? updated : s))
          .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
      );
    } catch (e) {
      console.error("Failed to toggle availability status", e);
    }
  };

  const openEdit = (slot: AvailabilitySlot) => {
    setEditState({
      open: true,
      slot,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      saving: false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editState.slot) return;
    setEditState((s) => ({ ...s, saving: true }));
    try {
      const updated = await updateAvailabilitySlot(editState.slot.id, {
        date: editState.date,
        startTime: editState.startTime,
        endTime: editState.endTime,
      });
      setSlots((prev) =>
        prev
          .map((s) => (s.id === updated.id ? updated : s))
          .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
      );
      setEditState({ open: false, slot: null, date: "", startTime: "", endTime: "", saving: false });
    } catch (e) {
      console.error("Failed to update slot", e);
      setEditState((s) => ({ ...s, saving: false }));
    }
  };

  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 relative z-10">
              Schedule & Availability
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl relative z-10">
              Manage your daily time slots, add new availability, and organize your work hours.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12 pt-4">
          
          {/* Section 1: Add Availability Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 dark:from-emerald-800 dark:to-slate-950 p-8 rounded-3xl shadow-2xl shadow-emerald-600/20 border border-emerald-500/50 relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
               <div className="absolute -right-4 -bottom-12 opacity-5 mix-blend-overlay group-hover:scale-110 group-hover:-rotate-6 transition-all duration-1000 pointer-events-none">
                 <CalendarDays className="w-80 h-80" strokeWidth={3} />
               </div>
               
               <h3 className="font-bold text-white text-xl flex items-center gap-3 tracking-tight mb-8 relative z-10">
                  <span className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                    <Plus className="h-5 w-5 text-emerald-100" />
                  </span>
                  Add Availability
               </h3>

               <form onSubmit={handleAddSlot} className="relative z-10 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-emerald-100/80">1. Select Date</label>
                    <Input 
                      type="date" 
                      required 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/50 focus:ring-emerald-400/50 rounded-2xl backdrop-blur-sm"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-widest text-emerald-100/80">2. Time Selection</label>
                      <button 
                        type="button"
                        onClick={() => setIsManual(!isManual)}
                        className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-emerald-100 px-3 py-1 rounded-full transition-all border border-white/10"
                      >
                        {isManual ? "Switch to Quick Select" : "Manual Entry"}
                      </button>
                    </div>

                    {isManual ? (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-emerald-200/60 uppercase">Start</label>
                          <Input 
                            type="time" 
                            value={manualStart}
                            onChange={(e) => setManualStart(e.target.value)}
                            className="h-12 bg-black/20 border-white/10 text-white focus:ring-emerald-400/50 rounded-2xl backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-emerald-200/60 uppercase">End</label>
                          <Input 
                            type="time" 
                            value={manualEnd}
                            onChange={(e) => setManualEnd(e.target.value)}
                            className="h-12 bg-black/20 border-white/10 text-white focus:ring-emerald-400/50 rounded-2xl backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 animate-in fade-in zoom-in-95 duration-300">
                        {[
                          "09:00", "10:00", "11:00", 
                          "12:00", "14:00", "15:00", 
                          "16:00", "17:00", "18:00"
                        ].map((t) => {
                          const displayTime = new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const isSelected = selectedTimes.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleTimeSelection(t)}
                              className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${isSelected ? "bg-white border-white text-emerald-700 shadow-xl scale-105 z-10" : "bg-black/10 border-white/5 text-emerald-100/60 hover:bg-black/20"}`}
                            >
                              {displayTime}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isAdding || (isManual ? (!manualStart || !manualEnd) : selectedTimes.length === 0)}
                    className="w-full h-12 mt-4 bg-white hover:bg-emerald-50 text-emerald-700 font-black tracking-widest uppercase rounded-2xl shadow-lg transition-all active:scale-95"
                  >
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : isManual ? "Add Custom Slot" : selectedTimes.length > 0 ? `Confirm ${selectedTimes.length} Slots` : "Confirm Availability"}
                  </Button>
               </form>
            </div>
            
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
               <div className="flex items-start gap-4">
                 <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                   <AlertTriangle className="h-5 w-5" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Important Note</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                     Slots marked as <strong className="text-slate-700 dark:text-slate-300">Booked</strong> have a patient appointment associated and cannot be deleted. Mark them as unavailable only if absolutely necessary.
                   </p>
                 </div>
               </div>
            </div>
          </div>

          {/* Section 2: My Schedule */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-8 flex flex-col shadow-lg shadow-slate-200/30 transition-all min-h-[500px]">
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My Schedule</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Manage active slots</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
                  {slots.length} Active Slots
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-emerald-500" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading schedule...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <CalendarDays className="h-16 w-16 mb-4 opacity-20 text-slate-500" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">No availability set</p>
                <p className="text-xs mt-2 opacity-60 text-slate-500">Add slots using the form to open your calendar.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 content-start">
                {slots.map((slot) => {
                  const slotDate = new Date(slot.date);
                  const isPast = slotDate < new Date(new Date().setHours(0,0,0,0));
                  const isUnavailable = (slot.status ?? "available") === "unavailable";
                  
                  return (
                    <div 
                      key={slot.id} 
                      className={`relative group p-6 rounded-[22px] border transition-all duration-300 ${
                        slot.isBooked 
                          ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-80' 
                          : isUnavailable
                            ? 'bg-rose-50/50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/50 opacity-80'
                            : isPast 
                              ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-50'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border transition-colors ${
                            slot.isBooked 
                              ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' 
                              : isUnavailable
                                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 group-hover:bg-emerald-100 group-hover:border-emerald-300'
                          }`}>
                            <CalendarDays className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                              {slotDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {slotDate.toLocaleDateString('en-IN', { year: 'numeric' })}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                              <Clock className="h-3 w-3" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {slot.startTime} to {slot.endTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        {slot.isBooked ? (
                          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                            Booked
                          </span>
                        ) : isUnavailable ? (
                          <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                            Unavailable
                          </span>
                        ) : (
                          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                            Available
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            disabled={slot.isBooked || isPast}
                            title="Edit Slot"
                            onClick={() => openEdit(slot)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                            disabled={slot.isBooked || isPast}
                            title={isUnavailable ? "Mark Available" : "Mark Unavailable"}
                            onClick={() => handleMarkUnavailable(slot)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(slot.id)}
                          disabled={slot.isBooked || deletingId === slot.id || isPast}
                          className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        >
                          {deletingId === slot.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3 mr-1.5" /> Delete</>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
      <Dialog
        open={editState.open}
        onOpenChange={(open) => !editState.saving && setEditState((s) => ({ ...s, open }))}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-lg w-full rounded-[28px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        >
          <DialogHeader className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-row items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Edit Slot</DialogTitle>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                Update date and time range
              </p>
            </div>
            <DialogClose
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              disabled={editState.saving}
            >
              <X className="h-5 w-5 text-slate-500" />
            </DialogClose>
          </DialogHeader>
          <div className="p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">Date</label>
              <Input
                type="date"
                value={editState.date}
                onChange={(e) => setEditState((s) => ({ ...s, date: e.target.value }))}
                className="h-11 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">Start</label>
                <Input
                  type="time"
                  value={editState.startTime}
                  onChange={(e) => setEditState((s) => ({ ...s, startTime: e.target.value }))}
                  className="h-11 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">End</label>
                <Input
                  type="time"
                  value={editState.endTime}
                  onChange={(e) => setEditState((s) => ({ ...s, endTime: e.target.value }))}
                  className="h-11 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveEdit}
              disabled={editState.saving || !editState.date || !editState.startTime || !editState.endTime}
              className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-widest uppercase"
            >
              {editState.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}