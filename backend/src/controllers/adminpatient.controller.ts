import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";


interface PatientFilters {
    search?: string;
    status?: string;
    condition?: string;
    department?: string;
}

interface CreatePatientInput {
    name: string;
    email: string;
    phone: string;
    status?: string;
    condition?: string;
    age?: string | number;
    gender?: string;
    department?: string;
    password?: string;
}

interface UpdatePatientInput {
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
    condition?: string;
    age?: string | number;
    gender?: string;
    department?: string;
}

interface IPatientRepository {
    findAll(filters: PatientFilters): Promise<unknown[]>;
    findLastPatientId(): Promise<string | null>;
    create(data: CreatePatientInput, nextId: string): Promise<unknown>;
    update(id: string, data: UpdatePatientInput): Promise<unknown>;
    remove(id: string): Promise<void>;
}

interface IPatientIdGenerator {
    generate(lastId: string | null): string;
}

interface IPasswordService {
    hash(plain: string): Promise<string>;
}


class PasswordService implements IPasswordService {
    private static instance: PasswordService;

    private constructor() { }

    public static getInstance(): PasswordService {
        if (!PasswordService.instance) {
            PasswordService.instance = new PasswordService();
        }
        return PasswordService.instance;
    }

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(String(plain), 10);
    }
}

class PatientIdGenerator implements IPatientIdGenerator {
    private static instance: PatientIdGenerator;

    private constructor() { }

    public static getInstance(): PatientIdGenerator {
        if (!PatientIdGenerator.instance) {
            PatientIdGenerator.instance = new PatientIdGenerator();
        }
        return PatientIdGenerator.instance;
    }

    generate(lastId: string | null): string {
        if (!lastId) return "P001";
        const lastNumber = parseInt(lastId.substring(1));
        return `P${(lastNumber + 1).toString().padStart(3, "0")}`;
    }
}

class PatientRepository implements IPatientRepository {
    private static instance: PatientRepository;

    private constructor() { }

    public static getInstance(): PatientRepository {
        if (!PatientRepository.instance) {
            PatientRepository.instance = new PatientRepository();
        }
        return PatientRepository.instance;
    }

    async findAll(filters: PatientFilters): Promise<unknown[]> {
        const whereClause: Record<string, unknown> = {};

        if (filters.search) {
            whereClause.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
                { patientId: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        if (filters.status) whereClause.status = filters.status;
        if (filters.condition) whereClause.condition = filters.condition;
        if (filters.department) whereClause.department = filters.department;

        return prisma.patient.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });
    }

    async findLastPatientId(): Promise<string | null> {
        const last = await prisma.patient.findFirst({
            where: { patientId: { startsWith: "P" } },
            orderBy: { createdAt: "desc" },
        });
        return last?.patientId ?? null;
    }

    async create(data: CreatePatientInput, nextId: string): Promise<unknown> {
        return prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({ where: { email: data.email } });
            if (existingUser) throw new ConflictError("User already exists with this email");

            if (data.password) {
                const passwordHash = await PasswordService.getInstance().hash(data.password);
                await tx.user.create({
                    data: { name: data.name, email: data.email, passwordHash, role: "patient" },
                });
            }

            return tx.patient.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    status: data.status || "active",
                    condition: data.condition || "Not specified",
                    age: data.age ? parseInt(String(data.age)) : null,
                    gender: data.gender,
                    department: data.department,
                    patientId: nextId,
                },
            });
        });
    }

    async update(id: string, data: UpdatePatientInput): Promise<unknown> {
        return prisma.patient.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
                ...(data.phone && { phone: data.phone }),
                ...(data.status && { status: data.status }),
                ...(data.condition && { condition: data.condition }),
                ...(data.age && { age: parseInt(String(data.age)) }),
                ...(data.gender && { gender: data.gender }),
                ...(data.department && { department: data.department }),
            },
        });
    }

    async remove(id: string): Promise<void> {
        await prisma.patient.delete({ where: { id } });
    }
}


class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConflictError";
    }
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

class PatientService {
    private static instance: PatientService;

    private constructor(
        private readonly repo: IPatientRepository,
        private readonly idGenerator: IPatientIdGenerator
    ) { }

    public static getInstance(): PatientService {
        if (!PatientService.instance) {
            PatientService.instance = new PatientService(
                PatientRepository.getInstance(),
                PatientIdGenerator.getInstance()
            );
        }
        return PatientService.instance;
    }

    async getPatients(filters: PatientFilters): Promise<unknown[]> {
        return this.repo.findAll(filters);
    }

    async createPatient(input: CreatePatientInput): Promise<unknown> {
        if (!input.name || !input.email || !input.phone) {
            throw new ValidationError("Name, email and phone are required");
        }

        const lastId = await this.repo.findLastPatientId();
        const nextId = this.idGenerator.generate(lastId);

        return this.repo.create(input, nextId);
    }

    async updatePatient(id: string, data: UpdatePatientInput): Promise<unknown> {
        return this.repo.update(id, data);
    }

    async deletePatient(id: string): Promise<void> {
        return this.repo.remove(id);
    }
}

function isPrismaError(error: unknown, code: string): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === code
    );
}

const patientService = PatientService.getInstance();

export const getPatients = async (req: Request, res: Response) => {
    try {
        const { search = "", status = "", condition = "", department = "" } = req.query;
        const patients = await patientService.getPatients({
            search: String(search),
            status: String(status),
            condition: String(condition),
            department: String(department),
        });
        res.json(patients);
    } catch (error) {
        console.error("Get Patients Error:", error);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    try {
        const result = await patientService.createPatient(req.body);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        if (error instanceof ConflictError || isPrismaError(error, "P2002")) {
            return res.status(400).json({ error: "Email or Patient ID already exists" });
        }
        console.error("Create Patient Error:", error);
        res.status(500).json({ error: "Failed to create patient" });
    }
};

export const updatePatient = async (req: Request, res: Response) => {
    try {
        const updated = await patientService.updatePatient(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        if (isPrismaError(error, "P2025")) {
            return res.status(404).json({ error: "Patient not found" });
        }
        console.error("Update Patient Error:", error);
        res.status(500).json({ error: "Failed to update patient" });
    }
};

export const deletePatient = async (req: Request, res: Response) => {
    try {
        await patientService.deletePatient(req.params.id);
        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        if (isPrismaError(error, "P2025")) {
            return res.status(404).json({ error: "Patient not found" });
        }
        console.error("Delete Patient Error:", error);
        res.status(500).json({ error: "Failed to delete patient" });
    }
};