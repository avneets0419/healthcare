import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";


declare global {
    var __prismaInstance: PrismaClient | undefined;
}

class PrismaClientSingleton {
    private static instance: PrismaClient;

    private constructor() { }                // Prevents direct instantiation

    static getInstance(): PrismaClient {
        if (!PrismaClientSingleton.instance) {
            // Reuse the global reference that survives Next.js / ts-node hot-reloads
            if (global.__prismaInstance) {
                PrismaClientSingleton.instance = global.__prismaInstance;
            } else {
                PrismaClientSingleton.instance = PrismaClientSingleton.create();
                if (process.env.NODE_ENV !== "production") {
                    global.__prismaInstance = PrismaClientSingleton.instance;
                }
            }
        }
        return PrismaClientSingleton.instance;
    }

    private static create(): PrismaClient {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL environment variable is not set");
        }
        const pool = new Pool({ connectionString, ssl: true });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({
            adapter,
            log:
                process.env.NODE_ENV === "development"
                    ? ["query", "error", "warn"]
                    : ["error"],
        });
    }
}


const db = PrismaClientSingleton.getInstance();


interface AppointmentFilters {
    search?: string;
    status?: string;
}

interface CreateAppointmentData {
    patientId: string;
    doctorId: string;
    type: string;
    time: string;           // ISO string
    price?: number | string;
    notes?: string;
}

interface UpdateStatusData {
    status: string;
}

interface RescheduleData {
    time: string;
}


class AvailabilitySlotService {
    constructor(private readonly client: PrismaClient) { }
    async markBooked(doctorId: string, isoTime: string): Promise<void> {
        const [date, startTime] = isoTime.split("T");
        if (!date || !startTime) return;

        await this.client.availabilitySlot.updateMany({
            where: { doctorId, date, startTime, isBooked: false },
            data: { isBooked: true },
        });
    }

    async markFree(doctorId: string, isoTime: string): Promise<void> {
        if (!isoTime.includes("T")) return;
        const [date, startTime] = isoTime.split("T");

        await this.client.availabilitySlot.updateMany({
            where: { doctorId, date, startTime },
            data: { isBooked: false },
        });
    }
}

class AppointmentRepository {
    private readonly slotService: AvailabilitySlotService;

    constructor(private readonly client: PrismaClient) {
        this.slotService = new AvailabilitySlotService(client);
    }

    async findAll(filters: AppointmentFilters) {
        const whereClause: Record<string, unknown> = {};

        if (filters.status) {
            whereClause.status = filters.status;
        }

        if (filters.search) {
            whereClause.OR = [
                { patientName: { contains: filters.search, mode: "insensitive" } },
                { id: { contains: filters.search, mode: "insensitive" } },
                { doctor: { name: { contains: filters.search, mode: "insensitive" } } },
            ];
        }

        return this.client.appointment.findMany({
            where: whereClause,
            include: { doctor: true, patient: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async create(data: CreateAppointmentData) {
        const patient = await this.client.patient.findUnique({
            where: { id: data.patientId },
        });
        if (!patient) throw new NotFoundError("Patient not found");

        const doctor = await this.client.doctor.findUnique({
            where: { id: data.doctorId },
        });
        if (!doctor) throw new NotFoundError("Doctor not found");

        const appointment = await this.client.appointment.create({
            data: {
                patientId: data.patientId,
                patientName: patient.name,
                doctorId: data.doctorId,
                type: data.type,
                time: data.time,
                status: "Scheduled",
                price: data.price ? parseFloat(String(data.price)) : 0,
                notes: data.notes,
            },
            include: { doctor: true, patient: true },
        });

        // Non-critical — failure must not roll back the appointment
        try {
            await this.slotService.markBooked(data.doctorId, data.time);
        } catch (err) {
            console.error("Failed to mark slot as booked:", err);
        }

        return appointment;
    }

    async updateStatus(id: string, data: UpdateStatusData) {
        return this.client.appointment.update({
            where: { id },
            data: { status: data.status },
            include: { doctor: true, patient: true },
        });
    }

    async delete(id: string): Promise<void> {
        const appt = await this.client.appointment.findUnique({ where: { id } });

        if (appt?.doctorId) {
            await this.slotService.markFree(appt.doctorId, appt.time);
        }

        await this.client.appointment.delete({ where: { id } });
    }

    async reschedule(id: string, data: RescheduleData) {
        const existing = await this.client.appointment.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError("Appointment not found");

        // Free the old slot
        if (existing.doctorId) {
            await this.slotService.markFree(existing.doctorId, existing.time);
        }

        // Persist the new time
        const updated = await this.client.appointment.update({
            where: { id },
            data: { time: data.time, status: "Scheduled" },
            include: { doctor: true, patient: true },
        });

        // Claim the new slot
        if (updated.doctorId) {
            await this.slotService.markBooked(updated.doctorId, data.time);
        }

        return updated;
    }
}

class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

class AppointmentService {
    constructor(private readonly repo: AppointmentRepository) { }

    getAll(filters: AppointmentFilters) {
        return this.repo.findAll(filters);
    }

    create(data: CreateAppointmentData) {
        if (!data.patientId || !data.doctorId || !data.type || !data.time) {
            throw new ValidationError("Missing required fields");
        }
        return this.repo.create(data);
    }

    updateStatus(id: string, data: UpdateStatusData) {
        if (!data.status) throw new ValidationError("Status is required");
        return this.repo.updateStatus(id, data);
    }

    delete(id: string) {
        return this.repo.delete(id);
    }

    reschedule(id: string, data: RescheduleData) {
        if (!data.time) throw new ValidationError("New time is required");
        return this.repo.reschedule(id, data);
    }
}


class AppointmentController {
    constructor(private readonly service: AppointmentService) { }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const { search = "", status = "" } = req.query as Record<string, string>;
            const data = await this.service.getAll({ search, status });
            res.status(200).json(data);
        } catch (err) {
            this.handleError(err, res);
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const appointment = await this.service.create(req.body as CreateAppointmentData);
            res.status(201).json(appointment);
        } catch (err) {
            this.handleError(err, res);
        }
    };

    updateStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const appointment = await this.service.updateStatus(id, req.body as UpdateStatusData);
            res.status(200).json(appointment);
        } catch (err) {
            this.handleError(err, res);
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.service.delete(req.params.id);
            res.status(204).send();
        } catch (err) {
            this.handleError(err, res);
        }
    };

    reschedule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const appointment = await this.service.reschedule(id, req.body as RescheduleData);
            res.status(200).json(appointment);
        } catch (err) {
            this.handleError(err, res);
        }
    };

    private handleError(err: unknown, res: Response): void {
        if (err instanceof ValidationError) {
            res.status(400).json({ message: err.message });
            return;
        }
        if (err instanceof NotFoundError) {
            res.status(404).json({ message: err.message });
            return;
        }
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ message });
    }
}

const repository = new AppointmentRepository(db);
const service = new AppointmentService(repository);
const controller = new AppointmentController(service);

export const getAllAppointments = controller.getAll;
export const createAppointment = controller.create;
export const updateAppointmentStatus = controller.updateStatus;
export const deleteAppointment = controller.delete;
export const rescheduleAppointment = controller.reschedule;