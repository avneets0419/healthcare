import { PrismaClient, Appointment, AvailabilitySlot } from "@prisma/client";
import { prisma } from "../lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DoctorListItem {
  id: string;
  name: string;
  specialization: string;
  isAvailable: boolean;
  image: string;
  status: string;
}

export interface SlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  isBooked: boolean;
}

export interface BookAppointmentPayload {
  doctorId: string;
  slotId: string;
  patientEmail: string;
  notes?: string;
}

export interface BookingResult {
  appointment: Appointment;
}

// ─── Repository interface ─────────────────────────────────────────────────────

export interface IPatientBookingRepository {
  findAllActiveDoctors(): Promise<DoctorListItem[]>;
  findAvailableSlotsByDoctor(doctorId: string): Promise<SlotItem[]>;
  findSlotById(slotId: string): Promise<AvailabilitySlot | null>;
  findPatientByEmail(email: string): Promise<{ id: string; name: string; email: string } | null>;
  findAppointmentsByPatientEmail(email: string): Promise<Appointment[]>;
  findAppointmentById(id: string): Promise<Appointment | null>;
  cancelAppointment(id: string): Promise<Appointment>;
  createAppointmentAndMarkSlot(
    payload: BookAppointmentPayload,
    patientId: string,
    patientName: string,
    doctorSpecialization: string,
    slot: AvailabilitySlot
  ): Promise<Appointment>;
}

// ─── Repository implementation ────────────────────────────────────────────────

class PatientBookingRepository implements IPatientBookingRepository {
  private static instance: PatientBookingRepository;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  static getInstance(db: PrismaClient): PatientBookingRepository {
    if (!PatientBookingRepository.instance) {
      PatientBookingRepository.instance = new PatientBookingRepository(db);
    }
    return PatientBookingRepository.instance;
  }

  async findAllActiveDoctors(): Promise<DoctorListItem[]> {
    const doctors = await this.db.doctor.findMany({
      where: { status: "Active" },
      select: {
        id: true,
        name: true,
        specialization: true,
        image: true,
        status: true,
        availability: {
          where: { status: "available", isBooked: false },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    return doctors.map((d) => ({
      id: d.id,
      name: d.name,
      specialization: d.specialization,
      image: d.image,
      status: d.status,
      isAvailable: d.availability.length > 0,
    }));
  }

  async findAvailableSlotsByDoctor(doctorId: string): Promise<SlotItem[]> {
    const slots = await this.db.availabilitySlot.findMany({
      where: { doctorId, status: "available", isBooked: false },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return slots.map((s) => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      isBooked: s.isBooked,
    }));
  }

  async findSlotById(slotId: string): Promise<AvailabilitySlot | null> {
    return this.db.availabilitySlot.findUnique({ where: { id: slotId } });
  }

  async findPatientByEmail(email: string): Promise<{ id: string; name: string; email: string } | null> {
    return this.db.patient.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
  }

  async findAppointmentsByPatientEmail(email: string): Promise<Appointment[]> {
    const patient = await this.db.patient.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!patient) return [];

    return this.db.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      include: {
        doctor: { select: { name: true, specialization: true, image: true } },
      },
    });
  }

  async findAppointmentById(id: string): Promise<Appointment | null> {
    return this.db.appointment.findUnique({ where: { id } });
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    return this.db.appointment.update({
      where: { id },
      data: { status: "cancelled" },
    });
  }

  async createAppointmentAndMarkSlot(
    payload: BookAppointmentPayload,
    patientId: string,
    patientName: string,
    doctorSpecialization: string,
    slot: AvailabilitySlot
  ): Promise<Appointment> {
    const [appointment] = await this.db.$transaction([
      this.db.appointment.create({
        data: {
          patientName,
          type: doctorSpecialization,
          time: `${slot.startTime} - ${slot.endTime}`,
          status: "upcoming",
          price: 0,
          timeSlot: new Date(`${slot.date}T${slot.startTime}:00`),
          notes: payload.notes ?? null,
          doctorId: payload.doctorId,
          patientId,
        },
      }),
      this.db.availabilitySlot.update({
        where: { id: payload.slotId },
        data: { isBooked: true, status: "unavailable" },
      }),
    ]);

    return appointment;
  }
}

// ─── Service interface ────────────────────────────────────────────────────────

export interface IPatientBookingService {
  getDoctors(): Promise<DoctorListItem[]>;
  getAvailableSlots(doctorId: string): Promise<SlotItem[]>;
  bookAppointment(payload: BookAppointmentPayload): Promise<BookingResult>;
  getMyAppointments(patientEmail: string): Promise<Appointment[]>;
  cancelAppointment(id: string, patientEmail: string): Promise<void>;
}

// ─── Service implementation ───────────────────────────────────────────────────

export class PatientBookingService implements IPatientBookingService {
  private static instance: PatientBookingService;
  private repo: IPatientBookingRepository;

  private constructor(repo: IPatientBookingRepository) {
    this.repo = repo;
  }

  static getInstance(): PatientBookingService {
    if (!PatientBookingService.instance) {
      const repo = PatientBookingRepository.getInstance(prisma);
      PatientBookingService.instance = new PatientBookingService(repo);
    }
    return PatientBookingService.instance;
  }

  async getDoctors(): Promise<DoctorListItem[]> {
    return this.repo.findAllActiveDoctors();
  }

  async getAvailableSlots(doctorId: string): Promise<SlotItem[]> {
    return this.repo.findAvailableSlotsByDoctor(doctorId);
  }

  async bookAppointment(payload: BookAppointmentPayload): Promise<BookingResult> {
    const slot = await this.repo.findSlotById(payload.slotId);
    if (!slot) throw new Error("Slot not found");
    if (slot.isBooked || slot.status !== "available") {
      throw new Error("Slot is no longer available");
    }

    const patient = await this.repo.findPatientByEmail(payload.patientEmail);
    if (!patient) throw new Error("Patient not found");

    const doctors = await this.repo.findAllActiveDoctors();
    const doctor = doctors.find((d) => d.id === payload.doctorId);
    if (!doctor) throw new Error("Doctor not found or inactive");

    const appointment = await this.repo.createAppointmentAndMarkSlot(
      payload,
      patient.id,
      patient.name,
      doctor.specialization,
      slot
    );

    return { appointment };
  }

  async getMyAppointments(patientEmail: string): Promise<Appointment[]> {
    return this.repo.findAppointmentsByPatientEmail(patientEmail);
  }

  async cancelAppointment(id: string, patientEmail: string): Promise<void> {
    // 1. Appointment must exist
    const appointment = await this.repo.findAppointmentById(id);
    if (!appointment) throw new Error("Appointment not found");

    // 2. Must belong to this patient
    const patient = await this.repo.findPatientByEmail(patientEmail);
    if (!patient || appointment.patientId !== patient.id) {
      throw new Error("Unauthorized to cancel this appointment");
    }

    // 3. Can only cancel upcoming/active appointments
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      throw new Error("Appointment cannot be cancelled");
    }

    await this.repo.cancelAppointment(id);
  }
}