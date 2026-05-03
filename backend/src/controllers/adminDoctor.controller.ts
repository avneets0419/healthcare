import { Request, Response } from "express";
import { getDoctors, addDoctor, updateDoctorDetails, removeDoctor } from "../models/doctor.model";
import bcrypt from "bcryptjs";
import { upsertUserByEmail } from "../models/user.model";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";


interface IDoctorRepository {
  fetchAll(search: string, specialization: string): Promise<unknown>;
  create(data: CreateDoctorInput): Promise<unknown>;
  findById(id: string): Promise<DoctorRecord | null>;
  update(id: string, data: UpdateDoctorInput): Promise<DoctorRecord>;
  remove(id: string): Promise<void>;
  getAvailability(doctorId: string): Promise<unknown>;
}

interface IUserSyncService {
  sync(email: string, name: string, passwordHash: string): Promise<void>;
}

interface IPasswordService {
  hash(plain: string): Promise<string>;
}


interface CreateDoctorInput {
  name: string;
  specialization: string;
  email: string;
  passwordHash: string;
  phone: string;
  experience: string;
}

interface UpdateDoctorInput {
  [key: string]: unknown;
  passwordHash?: string;
}

interface DoctorRecord {
  email: string;
  name: string;
  passwordHash?: string | null;
}


class DoctorRepository implements IDoctorRepository {
  private static instance: DoctorRepository;

  private constructor() { }

  public static getInstance(): DoctorRepository {
    if (!DoctorRepository.instance) {
      DoctorRepository.instance = new DoctorRepository();
    }
    return DoctorRepository.instance;
  }

  async fetchAll(search: string, specialization: string): Promise<unknown> {
    return getDoctors(search, specialization);
  }

  async create(data: CreateDoctorInput): Promise<unknown> {
    return addDoctor(data);
  }

  async findById(id: string): Promise<DoctorRecord | null> {
    return (prisma.doctor as any).findUnique({
      where: { id },
      select: { email: true, name: true, passwordHash: true },
    });
  }

  async update(id: string, data: UpdateDoctorInput): Promise<DoctorRecord> {
    return updateDoctorDetails(id, data);
  }

  async remove(id: string): Promise<void> {
    await removeDoctor(id);
  }

  async getAvailability(doctorId: string): Promise<unknown> {
    return prisma.availabilitySlot.findMany({
      where: { doctorId },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }
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


class UserSyncService implements IUserSyncService {
  private static instance: UserSyncService;

  private constructor() { }

  public static getInstance(): UserSyncService {
    if (!UserSyncService.instance) {
      UserSyncService.instance = new UserSyncService();
    }
    return UserSyncService.instance;
  }

  async sync(email: string, name: string, passwordHash: string): Promise<void> {
    await upsertUserByEmail(email, { name, passwordHash, role: "doctor" });
  }
}

class DoctorService {
  private static instance: DoctorService;

  private constructor(
    private readonly repo: IDoctorRepository,
    private readonly passwordService: IPasswordService,
    private readonly userSync: IUserSyncService
  ) { }

  public static getInstance(): DoctorService {
    if (!DoctorService.instance) {
      DoctorService.instance = new DoctorService(
        DoctorRepository.getInstance(),
        PasswordService.getInstance(),
        UserSyncService.getInstance()
      );
    }
    return DoctorService.instance;
  }

  async getAllDoctors(search: string, specialization: string) {
    return this.repo.fetchAll(search, specialization);
  }

  async createDoctor(body: {
    name: string;
    specialization: string;
    email: string;
    phone?: string;
    experience?: string;
    password: string;
  }) {
    const passwordHash = await this.passwordService.hash(body.password);

    const newDoctor = await this.repo.create({
      name: body.name,
      specialization: body.specialization,
      email: body.email,
      passwordHash,
      phone: body.phone || "+1 (000) 000-0000",
      experience: body.experience || "0 years",
    });

    await this.userSync.sync(body.email, body.name, passwordHash);

    return newDoctor;
  }

  async updateDoctor(id: string, body: Record<string, unknown>) {
    const { password, ...rest } = body;

    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Doctor not found");

    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await this.passwordService.hash(password as string);
    }

    const updated = await this.repo.update(id, {
      ...rest,
      ...(passwordHash ? { passwordHash } : {}),
    });

    const emailChanged = Boolean(rest?.email && rest.email !== existing.email);

    if (passwordHash) {
      await this.userSync.sync(updated.email, updated.name, passwordHash);
    } else if (emailChanged) {
      if (!existing.passwordHash) {
        throw new BusinessRuleError("Cannot change email before setting a doctor password.");
      }
      await this.userSync.sync(updated.email, updated.name, existing.passwordHash);
    }

    return updated;
  }

  async deleteDoctor(id: string): Promise<void> {
    await this.repo.remove(id);
  }

  async getDoctorAvailability(doctorId: string) {
    return this.repo.getAvailability(doctorId);
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
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


const doctorService = DoctorService.getInstance();

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const specialization = (req.query.specialization as string) || "";
    const result = await doctorService.getAllDoctors(search, specialization);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { name, specialization, email, password, phone, experience } = req.body;

    if (!name || !specialization || !email || !password) {
      res.status(400).json({ message: "name, specialization, email, and password are required" });
      return;
    }

    const newDoctor = await doctorService.createDoctor({ name, specialization, email, password, phone, experience });
    res.status(201).json(newDoctor);
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      res.status(409).json({ message: "A doctor with this email already exists" });
    } else {
      res.status(500).json({ message: "Failed to create doctor" });
    }
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const updated = await doctorService.updateDoctor(req.params.id, req.body || {});
    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof NotFoundError || isPrismaError(error, "P2025")) {
      res.status(404).json({ message: "Doctor not found" });
    } else if (error instanceof BusinessRuleError) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to update doctor" });
    }
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    await doctorService.deleteDoctor(req.params.id);
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      res.status(404).json({ message: "Doctor not found" });
    } else {
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  }
};

export const getDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const slots = await doctorService.getDoctorAvailability(req.params.id);
    res.status(200).json(slots);
  } catch {
    res.status(500).json({ message: "Failed to fetch doctor availability" });
  }
};