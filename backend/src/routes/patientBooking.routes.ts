import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { PatientBookingController } from "../controllers/patientBooking.controller";

const router = Router();
const ctrl = PatientBookingController.getInstance();

// All patient booking routes require a valid JWT with the "patient" role
router.use(authMiddleware, roleMiddleware(["patient"]));

/**
 * GET /patient/doctors
 * List all active doctors with real-time availability flag.
 * Used by the DoctorsPage component to populate the grid.
 */
router.get("/doctors", ctrl.getDoctors);

/**
 * GET /patient/doctors/:doctorId/slots
 * Fetch unbooked availability slots for a specific doctor.
 * Used by BookingModal to populate the time-slot picker.
 */
router.get("/doctors/:doctorId/slots", ctrl.getAvailableSlots);

/**
 * POST /patient/appointments
 * Book an appointment.
 * Body: { doctorId: string, slotId: string, notes?: string }
 */
router.post("/appointments", ctrl.bookAppointment);

/**
 * GET /patient/appointments
 * Fetch all appointments for the currently authenticated patient.
 */
router.get("/appointments", ctrl.getMyAppointments);

export default router;