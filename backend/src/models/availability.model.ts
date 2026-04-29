import { prisma } from "../lib/prisma";

export type CreateAvailabilityInput = {
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status?: "available" | "unavailable";
};

export const createAvailabilitySlot = async (data: CreateAvailabilityInput) => {
  return prisma.availabilitySlot.create({ data });
};

export const listAvailabilitySlotsByDoctor = async (doctorId: string) => {
  return prisma.availabilitySlot.findMany({
    where: { doctorId },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
};

export const deleteAvailabilitySlotById = async (id: string, doctorId: string) => {
  return prisma.availabilitySlot.delete({
    where: { id },
  });
};

export const getAvailabilitySlotById = async (id: string) => {
  return prisma.availabilitySlot.findUnique({ where: { id } });
};

