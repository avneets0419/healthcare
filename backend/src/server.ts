import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { adminRouter } from "./routes/admin.routes";
import { doctorRouter } from "./routes/doctor.routes";
import { patientRouter } from "./routes/patient.routes";
import { seedDefaultUsers } from "./models/user.model";
import { prisma } from "./lib/prisma";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3002"
  ],
  credentials: true,
}));
app.use(express.json());

app.use("/api", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/patient", patientRouter);
app.use("/api", doctorRouter);

app.use("/api", dashboardRoutes);


app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Healthcare API is running" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await seedDefaultUsers();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
