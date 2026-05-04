import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { PatientBookingController } from "../controllers/patientBooking.controller";

const router = Router();
const ctrl = PatientBookingController.getInstance();

// All patient booking routes require a valid JWT with the "patient" role
router.use(authMiddleware, roleMiddleware(["patient"]));
// Doctors
router.get("/doctors", ctrl.getDoctors);
router.get("/doctors/:doctorId/slots", ctrl.getAvailableSlots);

// Appointments
router.get("/appointments", ctrl.getMyAppointments);
router.post("/appointments", ctrl.bookAppointment);
router.patch("/appointments/:id/cancel", ctrl.cancelAppointment);

export default router;