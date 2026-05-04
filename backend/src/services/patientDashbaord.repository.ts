import { prisma } from "../lib/prisma";
import { Appointment } from "@prisma/client";

type AppointmentWithDoctor = Appointment & {
  doctor: { name: string; specialization: string; image: string } | null;
};

export interface IPatientDashboardRepository {
  findPatientByEmail(email: string): Promise<{ id: string } | null>;
  countAppointmentsByPatient(patientId: string): Promise<number>;
  countUpcomingByPatient(patientId: string): Promise<number>;
  getUpcomingByPatient(patientId: string, limit: number): Promise<AppointmentWithDoctor[]>;
  countPrescriptionsByPatient(patientId: string): Promise<number>;
}

class PatientDashboardRepository implements IPatientDashboardRepository {
  async findPatientByEmail(email: string): Promise<{ id: string } | null> {
    return prisma.patient.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  async countAppointmentsByPatient(patientId: string): Promise<number> {
    return prisma.appointment.count({ where: { patientId } });
  }

  async countUpcomingByPatient(patientId: string): Promise<number> {
    return prisma.appointment.count({
      where: { patientId, status: { in: ["upcoming", "active"] } },
    });
  }

  async getUpcomingByPatient(patientId: string, limit: number): Promise<AppointmentWithDoctor[]> {
    return prisma.appointment.findMany({
      where: { patientId, status: { in: ["upcoming", "active"] } },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        doctor: {
          select: { name: true, specialization: true, image: true },
        },
      },
    });
  }

  async countPrescriptionsByPatient(patientId: string): Promise<number> {
    return prisma.prescription.count({ where: { patientId } });
  }
}

export const patientDashboardRepository: IPatientDashboardRepository =
  new PatientDashboardRepository();