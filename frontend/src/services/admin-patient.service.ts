import { Patient, CreatePatientPayload, UpdatePatientPayload } from "@/types/patient.types";
import api from "@/lib/axios";

export const patientService = {
    getPatients: async (
        search: string = "",
        status: string = "",
        condition: string = "",
        department: string = ""
    ): Promise<Patient[]> => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (condition) params.append("condition", condition);
        if (department) params.append("department", department);

        const { data } = await api.get<Patient[]>(
            `/admin/patients?${params.toString()}`
        );

        return data;
    },

    createPatient: async (
        patientData: CreatePatientPayload
    ): Promise<Patient> => {
        const { data } = await api.post<Patient>("/admin/patients", patientData);
        return data;
    },

    updatePatient: async (
        id: string,
        patientData: UpdatePatientPayload
    ): Promise<Patient> => {
        const { data } = await api.put<Patient>(
            `/admin/patients/${id}`,
            patientData
        );
        return data;
    },

    deletePatient: async (id: string): Promise<{ message: string }> => {
        const { data } = await api.delete<{ message: string }>(
            `/admin/patients/${id}`
        );
        return data;
    },
};