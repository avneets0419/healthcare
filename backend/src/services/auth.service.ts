import { findUserByEmail, createUser } from "../models/user.model";
import { RegisterPayload, LoginPayload, AuthUser } from "../types";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.util";
import { prisma } from "../lib/prisma";

export class AuthService {
  public async registerUser(payload: RegisterPayload) {
    const existingUser = await findUserByEmail(payload.email);
    if (existingUser) {
      throw new Error("User already exists with this email.");
    }

    if (!payload.password) throw new Error("Password is required for registration.");
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const newUser = await createUser({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: "patient",
    });

    await prisma.patient.upsert({
      where: { email: newUser.email },
      update: { name: newUser.name },
      create: {
        name: newUser.name,
        email: newUser.email,
        phone: "+0000000000",
        status: "active",
        condition: "Not specified",
      },
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  }

  public async loginUser(payload: LoginPayload) {
    if (!payload.password) throw new Error("Password is required.");

    const user = await findUserByEmail(payload.email);
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password.");
    }

    if (user.role === "doctor") {
      await prisma.doctor.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          status: "Active",
        },
        create: {
          name: user.name,
          specialization: "General",
          email: user.email,
          phone: "Unknown",
          experience: "0 years",
          status: "Active",
        },
      });
    }

    if (user.role === "patient") {
      await prisma.patient.upsert({
        where: { email: user.email },
        update: { name: user.name },
        create: {
          name: user.name,
          email: user.email,
          phone: "+0000000000",
          status: "active",
          condition: "Not specified",
        },
      });
    }

    const tokenPayload: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name || "User",
      role: user.role as "admin" | "doctor" | "patient",
    };
    const token = generateToken(tokenPayload);

    return {
      token,
    };
  }
}

export const authService = new AuthService();