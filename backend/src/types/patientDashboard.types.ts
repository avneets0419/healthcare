export interface PatientAppointmentDTO {
  id: string;
  patientId: string | null;
  patientName: string;
  doctorId: string | null;
  doctorName: string;
  timeSlot: string;
  status: string;
}

export interface PatientDashboardStatsDTO {
  upcomingCount: number;
  totalAppointments: number;
  totalPrescriptions: number;
  unreadNotifications: number;
}

export interface PatientDashboardDTO {
  stats: PatientDashboardStatsDTO;
  upcomingAppointments: PatientAppointmentDTO[];
}