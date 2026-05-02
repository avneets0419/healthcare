import { Router } from "express";
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, getDoctorAvailability } from "../controllers/adminDoctor.controller";
import { getDashboardStats, getTrafficData } from "../controllers/adminDashbaord.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { getPatients, createPatient, updatePatient, deletePatient } from "../controllers/adminpatient.controller";
import { getAllAppointments, createAppointment, updateAppointmentStatus, deleteAppointment, rescheduleAppointment } from "../controllers/adminAppointment.controller";

const router = Router();

// ✅ PROTECT ALL ADMIN ROUTES
router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/dashboard", getDashboardStats);
router.get("/traffic", getTrafficData);

router.get("/doctors", getAllDoctors);
router.get("/doctors/:id/availability", getDoctorAvailability);
router.post("/doctors", createDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

router.get("/patients", getPatients);
router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

router.get("/appointments", getAllAppointments);
router.post("/appointments", createAppointment);
router.patch("/appointments/:id/status", updateAppointmentStatus);
router.post("/appointments/:id/reschedule", rescheduleAppointment);
router.delete("/appointments/:id", deleteAppointment);

export const adminRouter = router;