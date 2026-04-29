import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
export const seedDefaultUsers = async () => {
  const SALT_ROUNDS = 10;

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@test.com",
      passwordHash: await bcrypt.hash("123456", SALT_ROUNDS),
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "doctor@test.com" },
    update: {},
    create: {
      name: "Doctor",
      email: "doctor@test.com",
      passwordHash: await bcrypt.hash("123456", SALT_ROUNDS),
      role: "doctor",
    },
  });

  // Ensure the seeded doctor login has a matching Doctor profile (doctor endpoints resolve by email).
  await prisma.doctor.upsert({
    where: { email: "doctor@test.com" },
    update: {
      status: "Active",
    },
    create: {
      name: "Dr. Default Doctor",
      specialization: "General",
      email: "doctor@test.com",
      phone: "+1 (000) 000-0000",
      experience: "0 years",
      status: "Active",
    },
  });

  console.log("Default users seeded");
};

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const createUser = (data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}) => prisma.user.create({ data });

export const upsertUserByEmail = (email: string, data: { name: string; passwordHash: string; role: string }) =>
  prisma.user.upsert({
    where: { email },
    update: {
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role,
    },
    create: {
      name: data.name,
      email,
      passwordHash: data.passwordHash,
      role: data.role,
    },
  });
