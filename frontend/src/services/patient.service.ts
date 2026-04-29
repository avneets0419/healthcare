import api from "@/lib/axios";
import { Patient } from "@/types/patient.types";

export async function getMyPatientProfile(): Promise<Patient> {
  const { data } = await api.get<Patient>("/patient/me");
  return data;
}

export async function updateMyPatientProfile(payload: { name?: string; phone?: string }): Promise<Patient> {
  const { data } = await api.put<Patient>("/patient/me", payload);
  return data;
}

