import { Request, Response } from "express";
import { doctorService } from "../services/doctor.service";
import { AuthRequest } from "../middleware/auth.middleware";

const getEmail = (req: Request) => (req as AuthRequest).user?.email;

export const getDoctorMe = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const doctor = await doctorService.resolveDoctorByEmail(email);
    res.status(200).json({ id: doctor.id, status: doctor.status });
  } catch (e: any) {
    const msg = e?.message ?? "Failed to fetch doctor profile";
    const status = msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const data = await doctorService.getAppointments(email);

    // Map DB appointment -> frontend contract
    const mapped = (data as any[]).map((a) => ({
      id: a.id,
      patientId: a.patientId ?? "unknown",
      patientName: a.patientName,
      doctorId: a.doctorId ?? "unknown",
      doctorName: a.doctor?.name ?? "Doctor",
      timeSlot: (a.timeSlot ? a.timeSlot.toISOString() : new Date(Date.parse(a.time)).toISOString()),
      status: a.status || "pending",
      notes: a.notes ?? undefined,
    }));

    res.status(200).json(mapped);
  } catch (e: any) {
    const msg = e?.message ?? "Failed to fetch appointments";
    const status = msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    await doctorService.cancelAppointment(email, req.params.id);
    res.status(204).send();
  } catch (e: any) {
    const msg = e?.message ?? "Failed to cancel appointment";
    const status = msg.includes("not found") ? 404 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const completeAppointment = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    await doctorService.completeAppointment(email, req.params.id);
    res.status(204).send();
  } catch (e: any) {
    const msg = e?.message ?? "Failed to complete appointment";
    const status = msg.includes("not found") ? 404 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const addAvailability = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const { date, startTime, endTime, status } = req.body || {};
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: "date, startTime, and endTime are required" });
    }
    const slot = await doctorService.addAvailability(email, { date, startTime, endTime, status });
    res.status(201).json(slot);
  } catch (e: any) {
    const msg = e?.message ?? "Failed to add availability";
    const status = msg.includes("Unique constraint") ? 409 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const slots = await doctorService.getSchedule(email);
    res.status(200).json(slots);
  } catch (e: any) {
    const msg = e?.message ?? "Failed to fetch schedule";
    const status = msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const deleteAvailability = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    await doctorService.deleteAvailability(email, req.params.id);
    res.status(204).send();
  } catch (e: any) {
    const msg = e?.message ?? "Failed to delete slot";
    const status =
      msg.includes("cannot be deleted") ? 409 : msg.includes("not found") ? 404 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const { appointmentId, medicines, notes, patientName, patientId } = req.body || {};
    if (!appointmentId || !Array.isArray(medicines) || typeof notes !== "string") {
      return res.status(400).json({ message: "appointmentId, medicines[], and notes are required" });
    }
    const rx = await doctorService.createPrescription(email, { appointmentId, medicines, notes, patientName, patientId });

    // Map to frontend contract
    res.status(201).json({
      id: rx.id,
      appointmentId: rx.appointmentId,
      patientId: rx.patientId ?? "unknown",
      patientName: rx.patientName,
      medicines: rx.medicines,
      notes: rx.notes,
      createdAt: rx.createdAt.toISOString(),
    });
  } catch (e: any) {
    const msg = e?.message ?? "Failed to create prescription";
    const status = msg.includes("not found") ? 404 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const listPrescriptions = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const rx = await doctorService.listPrescriptions(email);
    res.status(200).json(
      rx.map((r: any) => ({
        id: r.id,
        appointmentId: r.appointmentId,
        patientId: r.patientId ?? "unknown",
        patientName: r.patientName,
        medicines: r.medicines,
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (e: any) {
    const msg = e?.message ?? "Failed to fetch prescriptions";
    const status = msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const updatePrescription = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const { medicines, notes, appointmentId } = req.body || {};
    const rx = await doctorService.updatePrescription(email, req.params.id, { medicines, notes, appointmentId });
    res.status(200).json({
      id: rx.id,
      appointmentId: rx.appointmentId,
      patientId: rx.patientId ?? "unknown",
      patientName: rx.patientName,
      medicines: rx.medicines,
      notes: rx.notes,
      createdAt: rx.createdAt.toISOString(),
    });
  } catch (e: any) {
    const msg = e?.message ?? "Failed to update prescription";
    const status = msg.includes("not found") ? 404 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const { date, startTime, endTime, status } = req.body || {};
    const updated = await doctorService.updateAvailability(email, req.params.id, { date, startTime, endTime, status });
    res.status(200).json(updated);
  } catch (e: any) {
    const msg = e?.message ?? "Failed to update slot";
    const status =
      msg.includes("cannot be edited") ? 409 : msg.includes("not found") ? 404 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const setDoctorStatus = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const { active } = req.body || {};
    if (typeof active !== "boolean") {
      return res.status(400).json({ message: "active(boolean) is required" });
    }
    const result = await doctorService.setDoctorStatus(email, active);
    res.status(200).json(result);
  } catch (e: any) {
    const msg = e?.message ?? "Failed to update status";
    const status = msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const deletePrescription = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    await doctorService.deletePrescription(email, req.params.id);
    res.status(204).send();
  } catch (e: any) {
    const msg = e?.message ?? "Failed to delete prescription";
    const status = msg.includes("not found") ? 404 : msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

export const getDoctorStats = async (req: Request, res: Response) => {
  try {
    const email = getEmail(req);
    if (!email) return res.status(401).json({ message: "Unauthorized" });
    const stats = await doctorService.getStats(email);
    res.status(200).json(stats);
  } catch (e: any) {
    const msg = e?.message ?? "Failed to fetch stats";
    const status = msg.includes("Doctor profile") ? 403 : 500;
    res.status(status).json({ message: msg });
  }
};

