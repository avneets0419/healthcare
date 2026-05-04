import api from '@/lib/axios';
import { PatientAppointment } from '@/types/appointment.types';

export interface PatientDashboardStats {
  upcomingCount: number;
  totalAppointments: number;
  totalPrescriptions: number;
  unreadNotifications: number;
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