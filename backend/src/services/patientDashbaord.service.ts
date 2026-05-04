import {
  IPatientDashboardRepository,
  patientDashboardRepository,
} from "./patientDashbaord.repository";
import {
  PatientDashboardDTO,
  PatientAppointmentDTO,
  PatientDashboardStatsDTO,
} from "../types/patientDashboard.types";
import { Appointment } from "@prisma/client";

export interface IPatientDashboardService {
  getDashboard(patientEmail: string): Promise<PatientDashboardDTO>;
}

function toAppointmentDTO(
  appt: Appointment & {
    doctor: { name: string; specialization: string; image: string } | null;
  }
): PatientAppointmentDTO {
  return {
    id: appt.id,
    patientId: appt.patientId,
    patientName: appt.patientName,
    doctorId: appt.doctorId,
    type: appt.type,
    time: appt.time,
    status: appt.status,
    timeSlot: appt.timeSlot ? appt.timeSlot.toISOString() : null,
    notes: appt.notes,
    createdAt: appt.createdAt.toISOString(),
    price: appt.price,
    doctor: appt.doctor ?? null,
  };
}

class PatientDashboardService implements IPatientDashboardService {
  constructor(private readonly repo: IPatientDashboardRepository) {}

  async getDashboard(patientEmail: string): Promise<PatientDashboardDTO> {
    const patient = await this.repo.findPatientByEmail(patientEmail);
    if (!patient) throw new Error("Patient not found");

    const [totalAppointments, upcomingCount, rawUpcoming, totalPrescriptions] =
      await Promise.all([
        this.repo.countAppointmentsByPatient(patient.id),
        this.repo.countUpcomingByPatient(patient.id),
        this.repo.getUpcomingByPatient(patient.id, 3),
        this.repo.countPrescriptionsByPatient(patient.id),
      ]);

    const stats: PatientDashboardStatsDTO = {
      upcomingCount,
      totalAppointments,
      totalPrescriptions,
      unreadNotifications: 0,
    };

    return {
      stats,
      upcomingAppointments: rawUpcoming.map(toAppointmentDTO),
    };
  }
}

export const patientDashboardService: IPatientDashboardService =
  new PatientDashboardService(patientDashboardRepository);