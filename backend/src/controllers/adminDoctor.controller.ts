import { Request, Response } from "express";
import { getDoctors, addDoctor, updateDoctorDetails, removeDoctor } from "../models/doctor.model";
import bcrypt from "bcryptjs";
import { upsertUserByEmail } from "../models/user.model";
import { prisma } from "../lib/prisma";

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const specialization = (req.query.specialization as string) || "";
    const result = await getDoctors(search, specialization);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { name, specialization, email, phone, experience, password } = req.body;

    if (!name || !specialization || !email || !password) {
      res.status(400).json({ message: "name, specialization, email, and password are required" });
      return;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const newDoctor = await addDoctor({
      name,
      specialization,
      email,
      passwordHash,
      phone: phone || "+1 (000) 000-0000",
      experience: experience || "0 years",
    });

    await upsertUserByEmail(email, {
      name,
      passwordHash,
      role: "doctor",
    });

    res.status(201).json(newDoctor);
  } catch (error: unknown) {
    const isPrismaUniqueViolation =
      typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002";
    if (isPrismaUniqueViolation) {
      res.status(409).json({ message: "A doctor with this email already exists" });
    } else {
      res.status(500).json({ message: "Failed to create doctor" });
    }
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body || {};

    const existing = (await (prisma.doctor as any).findUnique({
      where: { id: req.params.id },
      select: { email: true, name: true, passwordHash: true },
    })) as { email: string; name: string; passwordHash?: string | null } | null;
    if (!existing) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(String(password), 10);
    }

    const updated = await updateDoctorDetails(req.params.id, {
      ...rest,
      ...(passwordHash ? { passwordHash } : {}),
    });

    const emailChanged = Boolean(rest?.email && rest.email !== existing.email);
    if (passwordHash) {
      await upsertUserByEmail(updated.email, {
        name: updated.name,
        passwordHash,
        role: "doctor",
      });
    } else if (emailChanged) {
      if (!existing.passwordHash) {
        res.status(409).json({ message: "Cannot change email before setting a doctor password." });
        return;
      }
      await upsertUserByEmail(updated.email, {
        name: updated.name,
        passwordHash: existing.passwordHash,
        role: "doctor",
      });
    }

    res.status(200).json(updated);
  } catch (error: unknown) {
    const isNotFound =
      typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025";
    if (isNotFound) {
      res.status(404).json({ message: "Doctor not found" });
    } else {
      res.status(500).json({ message: "Failed to update doctor" });
    }
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    await removeDoctor(req.params.id);
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error: unknown) {
    const isNotFound =
      typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025";
    if (isNotFound) {
      res.status(404).json({ message: "Doctor not found" });
    } else {
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  }
};
export const getDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slots = await prisma.availabilitySlot.findMany({
      where: { doctorId: id },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ]
    });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctor availability" });
  }
};
