import { prisma } from "../lib/prisma";

export type Medicine = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

export type CreatePrescriptionInput = {
  appointmentId: string;
  doctorId: string;
  patientId?: string | null;
  patientName: string;
  medicines: Medicine[];
  notes: string;
};

export const createPrescription = async (data: CreatePrescriptionInput) => {
  return prisma.prescription.create({
    data: {
      appointmentId: data.appointmentId,
      doctorId: data.doctorId,
      patientId: data.patientId ?? null,
      patientName: data.patientName,
      medicines: data.medicines,
      notes: data.notes,
    },
  });
};

export const listPrescriptionsForDoctor = async (doctorId: string) => {
  return prisma.prescription.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
  });
};

export const getPrescriptionById = async (id: string) => {
  return prisma.prescription.findUnique({ where: { id } });
};

export const updatePrescriptionById = async (
  id: string,
  doctorId: string,
  data: Partial<Pick<CreatePrescriptionInput, "medicines" | "notes" | "patientName" | "patientId" | "appointmentId">>
) => {
  return prisma.prescription.update({
    where: { id },
    data: {
      ...(data.appointmentId ? { appointmentId: data.appointmentId } : {}),
      ...(data.patientId !== undefined ? { patientId: data.patientId } : {}),
      ...(data.patientName ? { patientName: data.patientName } : {}),
      ...(data.medicines ? { medicines: data.medicines } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  });
};

export const deletePrescriptionById = async (id: string) => {
  return prisma.prescription.delete({ where: { id } });
};

