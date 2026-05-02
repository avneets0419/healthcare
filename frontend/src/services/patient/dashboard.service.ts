import api from '@/lib/axios';
import { AppointmentStatus } from '@/types/appointment.types';

export interface PatientDashboardStats {
  upcomingCount: number;
  totalAppointments: number;
  totalPrescriptions: number;
  unreadNotifications: number;
}

export interface PatientAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  timeSlot: string;
  status: AppointmentStatus; 
}

export interface PatientDashboardResponse {
  stats: PatientDashboardStats;
  upcomingAppointments: PatientAppointment[];
}

export const patientDashboardService = {
  getDashboard: async (): Promise<PatientDashboardResponse> => {
    const { data } = await api.get('/patient/dashboard');
    return data;
  },
};