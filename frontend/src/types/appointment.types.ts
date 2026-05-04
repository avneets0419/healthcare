// ─── Doctor / Admin panel types (unchanged — do not modify) ──────────────────

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName?: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface CreateAppointmentPayload {
  doctorId: string;
  timeSlot: string;
  notes?: string;
}

// ─── Patient panel types (matches actual API response shape) ─────────────────
export interface PatientAppointment {
  id: string;
  patientId: string | null;
  patientName: string;
  doctorId: string | null;
  type?: string;           // optional
  time?: string;           // optional
  status: string;
  timeSlot: string | null;
  notes: string | null;
  createdAt?: string;      // optional
  price?: number;          // optional
  doctor?: {
    name: string;
    specialization: string;
    image: string;
  } | null;
  // flat fallback for dashboard which uses old Appointment shape
  doctorName?: string;
}