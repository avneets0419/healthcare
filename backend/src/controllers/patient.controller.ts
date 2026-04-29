import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const getEmail = (req: Request) => (req as AuthRequest).user?.email;

export const getMyPatientProfile = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const patient = await prisma.patient.findUnique({ where: { email } });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    res.status(200).json(patient);
  } catch (e: any) {
    res.status(500).json({ message: e?.message ?? "Failed to fetch profile" });
  }
};

export const updateMyPatientProfile = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const { name, phone, condition, status } = req.body || {};
    if (name !== undefined && typeof name !== "string") {
      return res.status(400).json({ message: "name must be a string" });
    }
    if (phone !== undefined && typeof phone !== "string") {
      return res.status(400).json({ message: "phone must be a string" });
    }

    const updated = await prisma.patient.update({
      where: { email },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(condition !== undefined ? { condition } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    res.status(200).json(updated);
  } catch (e: any) {
    const msg = e?.message ?? "Failed to update profile";
    const status = msg.includes("Record to update not found") ? 404 : 500;
    res.status(status).json({ message: msg });
  }
};

