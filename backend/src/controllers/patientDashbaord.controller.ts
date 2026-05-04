import { Request, Response } from "express";
import {
  IPatientDashboardService,
  patientDashboardService,
} from "../services/patientDashbaord.service";

class PatientDashboardController {
  constructor(private readonly service: IPatientDashboardService) {}

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      // JWT contains { id, email, name, role } — use email to resolve Patient row
      const patientEmail = (req as any).user?.email as string;

      if (!patientEmail) {
        res.status(401).json({ message: "Unauthorized: patient identity missing" });
        return;
      }

      const dashboard = await this.service.getDashboard(patientEmail);
      res.status(200).json(dashboard);
    } catch (error) {
      console.error("Patient Dashboard Error:", error);
      res.status(500).json({ message: "Failed to fetch patient dashboard" });
    }
  };
}

export const patientDashboardController = new PatientDashboardController(
  patientDashboardService
);