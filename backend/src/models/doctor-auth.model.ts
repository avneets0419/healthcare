import { prisma } from "../lib/prisma";

export async function getDoctorByUserEmail(email: string) {
  return prisma.doctor.findUnique({
    where: { email },
  });
}

