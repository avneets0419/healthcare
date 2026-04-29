import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import {
  addAvailability,
  cancelAppointment,
  completeAppointment,
  createPrescription,
  deleteAvailability,
  deletePrescription,
  getDoctorMe,
  getDoctorAppointments,
  getDoctorStats,
  getSchedule,
  listPrescriptions,
  setDoctorStatus,
  updatePrescription,
  updateAvailability,
} from "../controllers/doctor.controller";

const router = Router();

router.use(authMiddleware, roleMiddleware(["doctor"]));


router.get("/appointments", getDoctorAppointments);
router.delete("/appointments/:id", cancelAppointment);
router.patch("/appointments/:id/complete", completeAppointment);


router.post("/availability", addAvailability);
router.get("/schedule", getSchedule);
router.delete("/availability/:id", deleteAvailability);
router.put("/availability/:id", updateAvailability);


router.post("/prescriptions", createPrescription);
router.get("/prescriptions", listPrescriptions);
router.put("/prescriptions/:id", updatePrescription);
router.delete("/prescriptions/:id", deletePrescription);


router.get("/doctor/me", getDoctorMe);
router.get("/doctor/stats", getDoctorStats);
router.patch("/doctor/status", setDoctorStatus);

export { router as doctorRouter };

