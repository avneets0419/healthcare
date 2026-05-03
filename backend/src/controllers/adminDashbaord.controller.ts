import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Appointment } from "@prisma/client";


interface IDashboardRepository {
  getStats(): Promise<{
    totalRevenue: number;
    totalPatients: number;
    totalDoctors: number;
    activeDoctors: number;
    upcomingAppointments: Appointment[];
  }>;
}

interface ITrafficRepository {
  getWeeklyTraffic(): Promise<number[]>;
}


class PrismaRepository implements IDashboardRepository, ITrafficRepository {
  private static instance: PrismaRepository;

  private constructor() { }

  public static getInstance(): PrismaRepository {
    if (!PrismaRepository.instance) {
      PrismaRepository.instance = new PrismaRepository();
    }
    return PrismaRepository.instance;
  }

  async getStats(): Promise<{
    totalRevenue: number;
    totalPatients: number;
    totalDoctors: number;
    activeDoctors: number;
    upcomingAppointments: Appointment[];
  }> {
    const [totalRevenue, totalPatients, totalDoctors, activeDoctors, upcomingAppointments] =
      await Promise.all([
        prisma.appointment.aggregate({ _sum: { price: true } }),
        prisma.patient.count(),
        prisma.doctor.count(),
        prisma.doctor.count({ where: { status: "Active" } }),
        prisma.appointment.findMany({
          where: { status: "upcoming" },
          orderBy: { createdAt: "asc" },
          take: 3,
        }),
      ]);

    return {
      totalRevenue: totalRevenue._sum.price ?? 0,
      totalPatients,
      totalDoctors,
      activeDoctors,
      upcomingAppointments,
    };
  }

  async getWeeklyTraffic(): Promise<number[]> {
    const appointments = await prisma.appointment.findMany({
      select: { time: true },
    });

    const counts = Array(7).fill(0);

    appointments.forEach((a) => {
      if (!a.time) return;
      const parsed = new Date(Date.parse(a.time));
      if (!isNaN(parsed.getTime())) {
        counts[parsed.getDay()]++;
      }
    });

    return [...counts.slice(1), counts[0]];
  }
}


class DashboardService {
  constructor(private readonly repo: IDashboardRepository) { }

  async getDashboardStats() {
    return this.repo.getStats();
  }
}

class TrafficService {
  constructor(private readonly repo: ITrafficRepository) { }

  async getTrafficData() {
    return this.repo.getWeeklyTraffic();
  }
}


const repo = PrismaRepository.getInstance();
const dashboardService = new DashboardService(repo);
const trafficService = new TrafficService(repo);


export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const getTrafficData = async (req: Request, res: Response) => {
  try {
    const data = await trafficService.getTrafficData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Traffic Data Error:", error);
    res.status(500).json({ message: "Failed to fetch traffic data" });
  }
};