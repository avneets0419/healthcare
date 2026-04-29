import { prisma } from "../lib/prisma";

export const getDoctors = (search: string = "", specialization: string = "") => {
  return prisma.doctor.findMany({
    select: {
      id: true,
      name: true,
      specialization: true,
      email: true,
      phone: true,
      experience: true,
      status: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        specialization
          ? { specialization: { contains: specialization, mode: "insensitive" } }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getDoctorById = (id: string) =>
  prisma.doctor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      specialization: true,
      email: true,
      phone: true,
      experience: true,
      status: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

export const addDoctor = (data: {
  name: string;
  specialization: string;
  email: string;
  passwordHash?: string | null;
  phone: string;
  experience: string;
  status?: string;
  image?: string;
}) =>
  (prisma.doctor as any).create({
    data: {
      ...data,
      passwordHash: data.passwordHash ?? null,
    } as any,
    select: {
      id: true,
      name: true,
      specialization: true,
      email: true,
      phone: true,
      experience: true,
      status: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as ReturnType<typeof prisma.doctor.findFirst>;

export const updateDoctorDetails = (id: string, data: Partial<{
  name: string;
  specialization: string;
  email: string;
  passwordHash: string | null;
  phone: string;
  experience: string;
  status: string;
  image: string;
}>) =>
  prisma.doctor.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      specialization: true,
      email: true,
      phone: true,
      experience: true,
      status: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

export const removeDoctor = (id: string) =>
  prisma.doctor.delete({ where: { id } });
