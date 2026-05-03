import { Request, Response } from "express";
import { PatientBookingService, BookAppointmentPayload } from "../services/patientBooking.service";

export class PatientBookingController {
  private static instance: PatientBookingController;
  private service: PatientBookingService;

  private constructor(service: PatientBookingService) {
    this.service = service;
  }

  static getInstance(): PatientBookingController {
    if (!PatientBookingController.instance) {
      PatientBookingController.instance = new PatientBookingController(
        PatientBookingService.getInstance()
      );
    }
    return PatientBookingController.instance;
  }

  getDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctors = await this.service.getDoctors();
      res.json(doctors);
    } catch (err: any) {
      res.status(500).json({ error: err.message ?? "Failed to fetch doctors" });
    }
  };

  getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doctorId } = req.params;
      if (!doctorId) {
        res.status(400).json({ error: "doctorId is required" });
        return;
      }
      const slots = await this.service.getAvailableSlots(doctorId);
      res.json(slots);
    } catch (err: any) {
      res.status(500).json({ error: err.message ?? "Failed to fetch slots" });
    }
  };

  bookAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doctorId, slotId, notes } = req.body as Partial<BookAppointmentPayload>;

      if (!doctorId || !slotId) {
        res.status(400).json({ error: "doctorId and slotId are required" });
        return;
      }

      // JWT attaches { id, email, name, role } — we use email to find the Patient row
      const patientEmail: string | undefined = (req as any).user?.email;
      if (!patientEmail) {
        res.status(401).json({ error: "Unauthorized: patient identity missing" });
        return;
      }

      const result = await this.service.bookAppointment({
        doctorId,
        slotId,
        patientEmail,
        notes,
      });

      res.status(201).json({
        message: "Appointment booked successfully",
        appointment: result.appointment,
      });
    } catch (err: any) {
      const status =
        err.message === "Slot not found" ||
        err.message === "Patient not found" ||
        err.message === "Doctor not found or inactive"
          ? 404
          : err.message === "Slot is no longer available"
          ? 409
          : 500;

      res.status(status).json({ error: err.message ?? "Failed to book appointment" });
    }
  };

  getMyAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientEmail: string | undefined = (req as any).user?.email;
      if (!patientEmail) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const appointments = await this.service.getMyAppointments(patientEmail);
      res.json(appointments);
    } catch (err: any) {
      res.status(500).json({ error: err.message ?? "Failed to fetch appointments" });
    }
  };
}