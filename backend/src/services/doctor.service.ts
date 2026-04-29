import { getDoctorByUserEmail } from "../models/doctor-auth.model";
import {
  listAppointmentsForDoctor,
  getAppointmentById,
  cancelDoctorAppointment,
  completeDoctorAppointment,
} from "../models/doctor-appointment.model";
import {
  createAvailabilitySlot,
  getAvailabilitySlotById,
  listAvailabilitySlotsByDoctor,
} from "../models/availability.model";
import {
  createPrescription,
  deletePrescriptionById,
  getPrescriptionById,
  listPrescriptionsForDoctor,
  Medicine,
  updatePrescriptionById,
} from "../models/prescription.model";
import { prisma } from "../lib/prisma";

export class DoctorService {
  async resolveDoctorByEmail(email: string) {
    const doctor = await getDoctorByUserEmail(email);
    if (!doctor) {
      throw new Error("Doctor profile not found for this user email.");
    }
    return doctor;
  }

  async getAppointments(email: string) {
    const doctor = await this.resolveDoctorByEmail(email);
    return listAppointmentsForDoctor(doctor.id);
  }

  async cancelAppointment(email: string, appointmentId: string) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    const appt = await getAppointmentById(appointmentId);
    if (!appt || appt.doctorId !== doctorId) throw new Error("Appointment not found.");
    return cancelDoctorAppointment(appointmentId);
  }

  async completeAppointment(email: string, appointmentId: string) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    const appt = await getAppointmentById(appointmentId);
    if (!appt || appt.doctorId !== doctorId) throw new Error("Appointment not found.");
    return completeDoctorAppointment(appointmentId);
  }

  async addAvailability(
    email: string,
    payload: { date: string; startTime: string; endTime: string; status?: "available" | "unavailable" }
  ) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    return createAvailabilitySlot({
      doctorId,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: payload.status ?? "available",
    });
  }

  async getSchedule(email: string) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    return listAvailabilitySlotsByDoctor(doctorId);
  }

  async deleteAvailability(email: string, slotId: string) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    const slot = await getAvailabilitySlotById(slotId);
    if (!slot || slot.doctorId !== doctorId) throw new Error("Slot not found.");
    if (slot.isBooked) throw new Error("Booked slots cannot be deleted.");
    return prisma.availabilitySlot.delete({ where: { id: slotId } });
  }

  async updateAvailability(
    email: string,
    slotId: string,
    payload: Partial<{ date: string; startTime: string; endTime: string; status: "available" | "unavailable" }>
  ) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    const slot = await getAvailabilitySlotById(slotId);
    if (!slot || slot.doctorId !== doctorId) throw new Error("Slot not found.");
    if (slot.isBooked) throw new Error("Booked slots cannot be edited.");
    return prisma.availabilitySlot.update({
      where: { id: slotId },
      data: {
        ...(payload.date ? { date: payload.date } : {}),
        ...(payload.startTime ? { startTime: payload.startTime } : {}),
        ...(payload.endTime ? { endTime: payload.endTime } : {}),
        ...(payload.status ? { status: payload.status } : {}),
      },
    });
  }

  async createPrescription(
    email: string,
    payload: { appointmentId: string; medicines: Medicine[]; notes: string; patientName?: string; patientId?: string }
  ) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    let appt = await getAppointmentById(payload.appointmentId);

    // UI supports "direct prescription" (no real appointment). If appointment doesn't exist,
    // create a lightweight appointment placeholder so prescriptions can persist cleanly.
    if (!appt) {
      const now = new Date();
      appt = await prisma.appointment.create({
        data: {
          patientName: payload.patientName || "Unknown Patient",
          patientId: payload.patientId ?? null,
          doctorId,
          type: "General",
          time: now.toISOString(),
          timeSlot: now,
          status: "completed",
          price: 0,
          notes: payload.notes || null,
        },
      });
    } else if (appt.doctorId && appt.doctorId !== doctorId) {
      throw new Error("Appointment not found.");
    }

    return createPrescription({
      appointmentId: appt.id,
      doctorId,
      patientId: appt.patientId ?? null,
      patientName: appt.patientName,
      medicines: payload.medicines,
      notes: payload.notes,
    });
  }

  async listPrescriptions(email: string) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    return listPrescriptionsForDoctor(doctorId);
  }

  async updatePrescription(
    email: string,
    id: string,
    payload: Partial<{ appointmentId: string; medicines: Medicine[]; notes: string }>
  ) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    const rx = await getPrescriptionById(id);
    if (!rx || rx.doctorId !== doctorId) throw new Error("Prescription not found.");
    return updatePrescriptionById(id, doctorId, payload);
  }

  async deletePrescription(email: string, id: string) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;
    const rx = await getPrescriptionById(id);
    if (!rx || rx.doctorId !== doctorId) throw new Error("Prescription not found.");
    return deletePrescriptionById(id);
  }

  async getStats(email: string) {
    const doctorId = (await this.resolveDoctorByEmail(email)).id;

    const [totalAppointments, todayAppointments, pendingPrescriptions, totalPatients] = await Promise.all([
      prisma.appointment.count({ where: { doctorId } }),
      prisma.appointment.count({
        where: {
          doctorId,
          timeSlot: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
          },
        },
      }),
      prisma.prescription.count({
        where: { doctorId },
      }),
      prisma.appointment
        .findMany({
          where: { doctorId, patientName: { not: "" } },
          select: { patientId: true, patientName: true },
        })
        .then((rows) => {
          const set = new Set(rows.map((r) => r.patientId ?? r.patientName));
          return set.size;
        }),
    ]);

    return {
      totalAppointments,
      todayAppointments,
      pendingPrescriptions,
      totalPatients,
    };
  }

  async setDoctorStatus(email: string, active: boolean) {
    const doctor = await this.resolveDoctorByEmail(email);
    const status = active ? "Active" : "Inactive";
    return prisma.doctor.update({
      where: { id: doctor.id },
      data: { status },
      select: { id: true, status: true },
    });
  }
}

export const doctorService = new DoctorService();

