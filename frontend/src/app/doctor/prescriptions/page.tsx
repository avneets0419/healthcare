"use client";

import { useEffect, useState, useCallback } from "react";
import { getDoctorPrescriptions, createPrescription, updatePrescription, deletePrescription } from "@/services/doctor.service";
import { getDoctorAppointments } from "@/services/appointment.service";
import { Prescription } from "@/types/prescription.types";
import { Appointment } from "@/types/appointment.types";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Pill,
  Loader2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Trash2,
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  Search,
  Edit2,
  ClipboardList,
  Activity,
  History,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import AuthGuard from "@/components/shared/AuthGuard";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ── Validation Schema ──────────────────────────────────────────────
const medicineSchema = z.object({
  name: z.string().min(1, "Required"),
  dosage: z.string().min(1, "Required"),
  frequency: z.string().min(1, "Required"),
  duration: z.string().min(1, "Required"),
});

const prescriptionSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  medicines: z.array(medicineSchema).min(1, "Add at least one medicine"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof prescriptionSchema>;

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx1",
    appointmentId: "1",
    patientId: "p1",
    patientName: "Aarav Sharma",
    medicines: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "Twice daily", duration: "7 days" },
      { name: "Paracetamol", dosage: "650mg", frequency: "As needed", duration: "3 days" },
    ],
    notes: "Take medicines after meals. Drink plenty of water.",
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];

// ── Accordion Component ───────────────────────────────────────────
function PrescriptionAccordion({ 
  rx, 
  onEdit, 
  onDelete 
}: { 
  rx: Prescription, 
  onEdit: (rx: Prescription) => void, 
  onDelete: (id: string) => void 
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const date = new Date(rx.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={cn(
      "rounded-[28px] border transition-all duration-500 overflow-hidden group mb-4",
      open 
        ? "bg-white dark:bg-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border-teal-200/60 dark:border-teal-800" 
        : "bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800/50 hover:shadow-xl hover:shadow-slate-200/30"
    )}>
      <button
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-8 py-7 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors gap-4"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-6 min-w-0">
          <div className={cn(
            "h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border",
            open 
              ? "bg-teal-600 border-teal-500 text-white rotate-3 scale-110" 
              : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-teal-600 dark:text-teal-400 group-hover:bg-teal-50"
          )}>
            <FileText className="h-6 w-6" />
          </div>
          <div className="text-left min-w-0">
            <p className="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-none mb-2.5">
              {rx.patientName}
            </p>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                 <CalendarDays className="h-3.5 w-3.5 text-teal-500" /> {date}
               </span>
               <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                 <Pill className="h-3.5 w-3.5 text-teal-500" /> {rx.medicines.length} Items
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2.5 rounded-xl transition-all duration-300",
            open ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 rotate-180" : "text-slate-300"
          )}>
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </button>

      {open && (
        <div className="px-8 pb-8 pt-2 animate-in fade-in zoom-in-95 duration-500">
          <div className="border-t border-slate-100 dark:border-slate-700/50 pt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {rx.medicines.map((med, i) => (
                <div key={i} className="flex flex-col gap-3 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 group/med relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{med.name}</span>
                    <span className="text-[10px] font-black text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900 px-3.5 py-1.5 rounded-xl shadow-sm">{med.dosage}</span>
                  </div>
                  <div className="flex items-center gap-5 text-[11px] font-bold text-slate-500 dark:text-slate-400 relative z-10">
                     <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-500/50" /> {med.frequency}</span>
                     <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-teal-500/50" /> {med.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {rx.notes && (
              <div className="rounded-[24px] bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 px-7 py-6 text-sm font-semibold text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                  <ClipboardList className="h-3.5 w-3.5" /> Physician Directives
                </div>
                {rx.notes}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest" onClick={() => onEdit(rx)}>
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Record
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                onClick={async () => { setIsDeleting(true); await onDelete(rx.id); setIsDeleting(false); }} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />} Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRxId, setEditingRxId] = useState<string | null>(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { patientName: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }], notes: "" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

  const fetchData = useCallback(async () => {
    setLoadingList(true);
    try {
      const rxData = await getDoctorPrescriptions().catch(() => MOCK_PRESCRIPTIONS);
      setPrescriptions(rxData);
    } catch (error) { console.error(error); } finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editingRxId) {
        const updatedRx = await updatePrescription(editingRxId, { appointmentId: "direct-rx", medicines: values.medicines, notes: values.notes || "" });
        setPrescriptions((prev) => prev.map(rx => rx.id === editingRxId ? { ...updatedRx, patientName: values.patientName } : rx));
        setEditingRxId(null);
      } else {
        const newRx = await createPrescription({ appointmentId: "direct-rx", medicines: values.medicines, notes: values.notes || "" });
        setPrescriptions((prev) => [{ ...newRx, patientName: values.patientName }, ...prev]);
      }
      reset({ patientName: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }], notes: "" });
    } catch (err) {
      console.error(err);
      if (editingRxId) {
         setPrescriptions((prev) => prev.map(rx => rx.id === editingRxId ? { ...rx, patientName: values.patientName, medicines: values.medicines, notes: values.notes || "" } : rx));
         setEditingRxId(null);
      } else {
         const mockRx: Prescription = { id: Math.random().toString(), appointmentId: "direct-rx", patientId: "unknown", patientName: values.patientName, medicines: values.medicines, notes: values.notes || "", createdAt: new Date().toISOString() };
         setPrescriptions((prev) => [mockRx, ...prev]);
      }
      reset({ patientName: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }], notes: "" });
    } finally { setIsSubmitting(false); }
  };

  const handleEdit = (rx: Prescription) => {
    setEditingRxId(rx.id);
    reset({ patientName: rx.patientName, medicines: rx.medicines, notes: rx.notes || "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try { await deletePrescription(id); setPrescriptions(prev => prev.filter(rx => rx.id !== id)); } catch (err) { setPrescriptions(prev => prev.filter(rx => rx.id !== id)); }
  };

  const filteredRx = prescriptions.filter((rx) => rx.patientName.toLowerCase().includes(search.toLowerCase()));

  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 max-w-[1600px] mx-auto pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">Prescription Workspace</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">Create digital prescriptions and manage clinical history with precision.</p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-slate-900 dark:text-white text-xl flex items-center gap-3 tracking-tight">
                    <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400">
                      {editingRxId ? <Edit2 className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                    </div>
                    {editingRxId ? "Edit Medical Order" : "New Medical Order"}
                 </h3>
                 {editingRxId && (
                   <Button variant="ghost" size="sm" onClick={() => { setEditingRxId(null); reset({ patientName: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }], notes: "" }); }} className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                 )}
               </div>

               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Patient Identity</Label>
                    <Input placeholder="Full legal name..." {...register("patientName")} className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 focus:border-teal-500/50 focus:ring-teal-500/20 rounded-[20px] px-5 font-bold text-slate-900 dark:text-white" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Medication Regimen</Label>
                      <Button type="button" variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:bg-teal-50" onClick={() => append({ name: "", dosage: "", frequency: "", duration: "" })}>
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Add Item
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-5 rounded-[24px] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Medication #{index + 1}</span>
                            {fields.length > 1 && <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-rose-300 hover:text-rose-600" onClick={() => remove(index)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                          </div>
                          <div className="grid gap-3 grid-cols-2">
                            <Input placeholder="Medicine..." {...register(`medicines.${index}.name`)} className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-xs font-bold" />
                            <Input placeholder="Dosage..." {...register(`medicines.${index}.dosage`)} className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-xs font-bold" />
                            <Input placeholder="Frequency..." {...register(`medicines.${index}.frequency`)} className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-xs font-bold" />
                            <Input placeholder="Duration..." {...register(`medicines.${index}.duration`)} className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-xs font-bold" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Clinical Observations</Label>
                    <Textarea placeholder="Specific instructions for the patient..." {...register("notes")} className="h-28 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 focus:border-teal-500/50 rounded-[20px] px-5 py-4 font-bold text-slate-900 dark:text-white resize-none" />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white font-black tracking-[0.15em] uppercase rounded-[20px] shadow-lg shadow-teal-600/20 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{editingRxId ? "Update Clinical Record" : "Finalize Prescription"} <ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
               </form>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl min-h-[700px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                    <History className="h-5 w-5 text-slate-400" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Chart History</h3>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Filter by patient..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 text-sm font-bold" />
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[1000px]">
              {loadingList ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-teal-500" />
                  <p className="text-xs font-black uppercase tracking-widest">Retrieving Records...</p>
                </div>
              ) : filteredRx.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <Activity className="h-12 w-12 mb-4 text-slate-200" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400">No matching charts found</p>
                </div>
              ) : (
                filteredRx.map((rx) => <PrescriptionAccordion key={rx.id} rx={rx} onEdit={handleEdit} onDelete={handleDelete} />)
              )}
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.2); border-radius: 10px; }
      `}} />
    </AuthGuard>
  );
}

