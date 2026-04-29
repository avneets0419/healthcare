import { prisma } from "../lib/prisma";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export const listAppointmentsForDoctor = async (doctorId: string) => {
  return prisma.appointment.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
  });
};

export const getAppointmentById = async (id: string) => {
  return prisma.appointment.findUnique({ where: { id } });
};

export const cancelDoctorAppointment = async (id: string) => {
  return prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });
};

export const completeDoctorAppointment = async (id: string) => {
  return prisma.appointment.update({
    where: { id },
    data: { status: "completed" },
  });
};

