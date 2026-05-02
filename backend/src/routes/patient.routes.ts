import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { getMyPatientProfile, updateMyPatientProfile } from "../controllers/patient.controller";
import { patientDashboardController } from "../controllers/patientDashbaord.controller";

const router = Router();

router.use(authMiddleware, roleMiddleware(["patient"]));

router.get("/me", getMyPatientProfile);
router.put("/me", updateMyPatientProfile);
router.get("/dashboard", patientDashboardController.getDashboard);
export { router as patientRouter };

