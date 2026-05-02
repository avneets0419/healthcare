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
  getDashboard(patientId: string): Promise<PatientDashboardDTO>;
}

function toAppointmentDTO(
  appt: Appointment & { doctor: { name: string } | null }
): PatientAppointmentDTO {
  return {
    id: appt.id,
    patientId: appt.patientId,
    patientName: appt.patientName,
    doctorId: appt.doctorId,
    doctorName: appt.doctor?.name ?? "Unknown",
    timeSlot: appt.time,
    status: appt.status,
  };
}

class PatientDashboardService implements IPatientDashboardService {
  constructor(private readonly repo: IPatientDashboardRepository) {}

  async getDashboard(patientId: string): Promise<PatientDashboardDTO> {
    const [
  totalAppointments,
  upcomingCount,
  rawUpcoming,
  totalPrescriptions,
] = await Promise.all([
  this.repo.countAppointmentsByPatient(patientId),
  this.repo.countUpcomingByPatient(patientId),
  this.repo.getUpcomingByPatient(patientId, 3),
  this.repo.countPrescriptionsByPatient(patientId),
]);

const stats: PatientDashboardStatsDTO = {
  upcomingCount,
  totalAppointments,
  totalPrescriptions,
  unreadNotifications: 0,
}

    return {
      stats,
      upcomingAppointments: rawUpcoming.map(toAppointmentDTO),
    };
  }
}

export const patientDashboardService: IPatientDashboardService =
  new PatientDashboardService(patientDashboardRepository);