import api from "@/lib/axios";
import { Appointment } from "@/types/appointment.types";

export const adminAppointmentService = {
  getAllAppointments: async (search: string = "", status: string = "") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    
    const { data } = await api.get<Appointment[]>(`/admin/appointments?${params.toString()}`);
    return data;
  },

  createAppointment: async (appointmentData: {
    patientId: string;
    doctorId: string;
    type: string;
    time: string;
    price?: number;
    notes?: string;
  }) => {
    const { data } = await api.post<Appointment>("/admin/appointments", appointmentData);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch<Appointment>(`/admin/appointments/${id}/status`, { status });
    return data;
  },

  deleteAppointment: async (id: string) => {
    await api.delete(`/admin/appointments/${id}`);
  },

  rescheduleAppointment: async (id: string, time: string) => {
    const { data } = await api.post<Appointment>(`/admin/appointments/${id}/reschedule`, { time });
    return data;
  }
};
