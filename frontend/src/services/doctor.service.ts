import api from "@/lib/axios";
import {
  AvailabilitySlot,
  CreateAvailabilityPayload,
  DoctorStats,
} from "@/types/doctor.types";
import { Prescription, CreatePrescriptionPayload } from "@/types/prescription.types";

// ── Availability ─────────────────────────────────────────────────────────────

/** POST /availability  — add a new slot */
export const addAvailabilitySlot = async (
  payload: CreateAvailabilityPayload
): Promise<AvailabilitySlot> => {
  const { data } = await api.post<AvailabilitySlot>("/availability", payload);
  return data;
};

/** GET /schedule  — fetch the doctor's own schedule */
export const getDoctorSchedule = async (): Promise<AvailabilitySlot[]> => {
  const { data } = await api.get<AvailabilitySlot[]>("/schedule");
  return data;
};

/** DELETE /availability/:id  — remove a slot */
export const deleteAvailabilitySlot = async (id: string): Promise<void> => {
  await api.delete(`/availability/${id}`);
};

/** PUT /availability/:id — edit a slot */
export const updateAvailabilitySlot = async (
  id: string,
  payload: Partial<CreateAvailabilityPayload>
): Promise<AvailabilitySlot> => {
  const { data } = await api.put<AvailabilitySlot>(`/availability/${id}`, payload);
  return data;
};

// ── Prescriptions ─────────────────────────────────────────────────────────────

/** POST /prescriptions  — create a prescription */
export const createPrescription = async (
  payload: CreatePrescriptionPayload
): Promise<Prescription> => {
  const { data } = await api.post<Prescription>("/prescriptions", payload);
  return data;
};

/** GET /prescriptions  — get all prescriptions written by this doctor */
export const getDoctorPrescriptions = async (): Promise<Prescription[]> => {
  const { data } = await api.get<Prescription[]>("/prescriptions");
  return data;
};

/** DELETE /prescriptions/:id  — remove a prescription */
export const deletePrescription = async (id: string): Promise<void> => {
  await api.delete(`/prescriptions/${id}`);
};

/** PUT /prescriptions/:id  — update a prescription */
export const updatePrescription = async (
  id: string,
  payload: Partial<CreatePrescriptionPayload>
): Promise<Prescription> => {
  const { data } = await api.put<Prescription>(`/prescriptions/${id}`, payload);
  return data;
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────

/** GET /doctor/stats  — aggregated numbers for the dashboard */
export const getDoctorStats = async (): Promise<DoctorStats> => {
  const { data } = await api.get<DoctorStats>("/doctor/stats");
  return data;
};

/** GET /doctor/me — current doctor profile (status) */
export const getDoctorMe = async (): Promise<{ id: string; status: string }> => {
  const { data } = await api.get<{ id: string; status: string }>("/doctor/me");
  return data;
};

/** PATCH /doctor/status — toggle active/inactive */
export const setDoctorStatus = async (active: boolean): Promise<{ id: string; status: string }> => {
  const { data } = await api.patch<{ id: string; status: string }>("/doctor/status", { active });
  return data;
};
