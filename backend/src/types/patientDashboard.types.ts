// Matches PatientAppointment in appointment.types.ts exactly
export interface PatientAppointmentDTO {
  id: string;
  patientId: string | null;
  patientName: string;
  doctorId: string | null;
  type: string;
  time: string;
  status: string;
  timeSlot: string | null;
  notes: string | null;
  createdAt: string;
  price: number;
  doctor?: {
    name: string;
    specialization: string;
    image: string;
  } | null;
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