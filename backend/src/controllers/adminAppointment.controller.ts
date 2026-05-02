import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllAppointments = async (req: Request, res: Response) => {
    try {
        const { search = "", status = "" } = req.query;
        
        const whereClause: any = {};
        
        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.OR = [
                { patientName: { contains: String(search), mode: 'insensitive' } },
                { id: { contains: String(search), mode: 'insensitive' } },
                { doctor: { name: { contains: String(search), mode: 'insensitive' } } }
            ];
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                doctor: true,
                patient: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(appointments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const { patientId, doctorId, type, time, price, notes } = req.body;

        if (!patientId || !doctorId || !type || !time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                patientName: patient.name,
                doctorId,
                type,
                time, // Expected format: ISO string or readable string
                status: "Scheduled",
                price: price ? parseFloat(price) : 0,
                notes
            },
            include: {
                doctor: true,
                patient: true
            }
        });

        // ✅ Mark availability slot as booked to prevent conflicts
        try {
            const [datePart, timePart] = time.split('T');
            if (datePart && timePart) {
                await prisma.availabilitySlot.updateMany({
                    where: {
                        doctorId,
                        date: datePart,
                        startTime: timePart,
                        isBooked: false
                    },
                    data: {
                        isBooked: true
                    }
                });
            }
        } catch (err) {
            console.error("Failed to mark slot as booked:", err);
            // Non-critical error, we still created the appointment
        }

        res.status(201).json(appointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                doctor: true,
                patient: true
            }
        });

        res.status(200).json(appointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.appointment.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
