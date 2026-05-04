import api from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientAppointment {
  id: string;
  patientName: string;
  type: string;
  time: string;
  status: string;
  timeSlot: string | null;
  notes: string | null;
  doctorId: string | null;
  patientId: string | null;
  createdAt: string;
  price: number;
  doctor?: {
    name: string;
    specialization: string;
    image: string;
  } | null;
}

export interface CancelAppointmentResponse {
  message: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const patientAppointmentService = {
  /**
   * Fetch all appointments for the logged-in patient.
   * Maps to: GET /patient/appointments
   */
  getMyAppointments: async (): Promise<PatientAppointment[]> => {
    const { data } = await api.get('/patient/appointments');
    return data;
  },

  /**
   * Cancel a specific appointment.
   * Maps to: PATCH /patient/appointments/:id/cancel
   */
  cancelAppointment: async (id: string): Promise<CancelAppointmentResponse> => {
    const { data } = await api.patch(`/patient/appointments/${id}/cancel`);
    return data;
  },
};