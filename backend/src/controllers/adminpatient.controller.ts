import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const getPatients = async (req: Request, res: Response) => {
    try {
        const { search = "", status = "", condition = "", department = "" } = req.query;
        const whereClause: any = {};

        if (search) {
            whereClause.OR = [
                {
                    name: { contains: String(search), mode: "insensitive" },
                },
                {
                    email: { contains: String(search), mode: "insensitive" },
                },
                {
                    patientId: { contains: String(search), mode: "insensitive" },
                },
            ];
        }

        if (status) whereClause.status = String(status);
        if (condition) whereClause.condition = String(condition);
        if (department) whereClause.department = String(department);

        const patients = await prisma.patient.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        res.json(patients);
    } catch (error) {
        console.error("Get Patients Error:", error);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, status, condition, age, gender, department, password } = req.body;
        if (!name || !email || !phone) {
            return res
                .status(400)
                .json({ error: "Name, email and phone are required" });
        }

        // Generate Serial Patient ID (e.g., P001, P002)
        const lastPatient = await prisma.patient.findFirst({
            where: {
                patientId: {
                    startsWith: "P",
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        let nextId = "P001";
        if (lastPatient && lastPatient.patientId) {
            const lastIdNumber = parseInt(lastPatient.patientId.substring(1));
            nextId = `P${(lastIdNumber + 1).toString().padStart(3, "0")}`;
        }

        // Use a transaction to create both User and Patient
        const result = await prisma.$transaction(async (tx) => {
            // Check if User already exists
            const existingUser = await tx.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error("User already exists with this email");
            }

            // Create User record if password is provided
            if (password) {
                const passwordHash = await bcrypt.hash(password, 10);
                await tx.user.create({
                    data: {
                        name,
                        email,
                        passwordHash,
                        role: "patient",
                    },
                });
            }

            // Create Patient record
            return await tx.patient.create({
                data: {
                    name,
                    email,
                    phone,
                    status: status || "active",
                    condition: condition || "Not specified",
                    age: age ? parseInt(age) : null,
                    gender,
                    department,
                    patientId: nextId,
                },
            });
        });

        res.status(201).json(result);
    } catch (error: any) {
        if (error.code === "P2002" || error.message === "User already exists with this email") {
            return res.status(400).json({ error: "Email or Patient ID already exists" });
        }

        console.error("Create Patient Error:", error);
        res.status(500).json({ error: "Failed to create patient" });
    }
};

// ✅ UPDATE Patient
export const updatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, status, condition } = req.body;

        const updatedPatient = await prisma.patient.update({
            where: { id },

            // ✅ FIX: prevent overwriting with undefined
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(status && { status }),
                ...(condition && { condition }),
            },
        });

        res.json(updatedPatient);
    } catch (error) {
        console.error("Update Patient Error:", error);
        res.status(500).json({ error: "Failed to update patient" });
    }
};

// ✅ DELETE Patient
export const deletePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.patient.delete({
            where: { id },
        });

        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error("Delete Patient Error:", error);
        res.status(500).json({ error: "Failed to delete patient" });
    }
};