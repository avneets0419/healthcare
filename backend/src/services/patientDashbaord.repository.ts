import { prisma } from "../lib/prisma";
import { Appointment } from "@prisma/client";

export interface IPatientDashboardRepository {
  countAppointmentsByPatient(patientId: string): Promise<number>;
  countUpcomingByPatient(patientId: string): Promise<number>;
  getUpcomingByPatient(
    patientId: string,
    limit: number
  ): Promise<(Appointment & { doctor: { name: string } | null })[]>;
  countPrescriptionsByPatient(patientId: string): Promise<number>;
}

class PatientDashboardRepository implements IPatientDashboardRepository {
  async countAppointmentsByPatient(patientId: string): Promise<number> {
    return prisma.appointment.count({
      where: { patientId },
    });
  }

  async countUpcomingByPatient(patientId: string): Promise<number> {
    return prisma.appointment.count({
      where: { patientId, status: "upcoming" },
    });
  }

  async getUpcomingByPatient(
    patientId: string,
    limit: number
  ): Promise<(Appointment & { doctor: { name: string } | null })[]> {
    return prisma.appointment.findMany({
      where: { patientId, status: "upcoming" },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        doctor: { select: { name: true } },
      },
    });
  }

  async countPrescriptionsByPatient(patientId: string): Promise<number> {
    return prisma.prescription.count({
      where: { patientId },
    });
  }
}

export const patientDashboardRepository: IPatientDashboardRepository =
  new PatientDashboardRepository();