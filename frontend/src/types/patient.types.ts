export type PatientStatus = "active" | "inactive" | "recovered" | "under_treatment";

export interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    status?: string;
    condition?: string;
    createdAt: string;
    age?: number;
    gender?: string;
    patientId?: string;
    department?: string;
}

export interface CreatePatientPayload {
    name: string;
    email: string;
    phone: string;
    status?: string;
    condition?: string;
    age?: number;
    gender?: string;
    department?: string;
    password?: string;
}

export interface UpdatePatientPayload {
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
    condition?: string;
    age?: number;
    gender?: string;
    department?: string;
}