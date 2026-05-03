import api from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientDoctor {
  id: string;
  name: string;
  specialization: string;
  isAvailable: boolean;
  image?: string;
  status: string;
}

export interface DoctorSlot {
  id: string;
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
  status: string;
  isBooked: boolean;
}

export interface BookAppointmentPayload {
  doctorId: string;
  slotId: string;
  notes?: string;
}

export interface BookedAppointment {
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
}

export interface BookAppointmentResponse {
  message: string;
  appointment: BookedAppointment;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const patientDoctorService = {
  /**
   * Fetch all active doctors with real-time availability flag.
   * Maps to: GET /patient/doctors
   */
  getDoctors: async (): Promise<PatientDoctor[]> => {
    const { data } = await api.get('/patient/doctors');
    return data;
  },

  /**
   * Fetch all unbooked slots for a specific doctor.
   * Maps to: GET /patient/doctors/:doctorId/slots
   */
  getAvailableSlots: async (doctorId: string): Promise<DoctorSlot[]> => {
    const { data } = await api.get(`/patient/doctors/${doctorId}/slots`);
    return data;
  },

  /**
   * Book an appointment for the logged-in patient.
   * Maps to: POST /patient/appointments
   */
  bookAppointment: async (payload: BookAppointmentPayload): Promise<BookAppointmentResponse> => {
    const { data } = await api.post('/patient/appointments', payload);
    return data;
  },

  /**
   * Fetch all appointments for the logged-in patient.
   * Maps to: GET /patient/appointments
   */
  getMyAppointments: async (): Promise<BookedAppointment[]> => {
    const { data } = await api.get('/patient/appointments');
    return data;
  },
};