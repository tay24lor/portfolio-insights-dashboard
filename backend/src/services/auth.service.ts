import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { users, User } from "../models/User";
import { mockDb } from "../mock/mock.db";
import dotenv from "dotenv";
import { config } from "../config/env";

dotenv.config();

export class AuthService {
  async register(email: string, password: string) {
    const existing = users.find(u => u.email === email);
    if (existing) throw new Error("User already exists");

    const hashed = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: users.length + 1,
      email,
      password: hashed
    };

    users.push(newUser);

    return { message: "User registered successfully" };
  }

  async login(email: string, password: string) {
    let user: User | null = (users.find(u => u.email === email) as User) ?? null;

    // Fallback to mock DB for development/testing
    if (!user) {
      const maybe = (await mockDb.getUserByEmail(email)) as unknown as User | null;
      if (maybe) user = maybe;
    }

    if (!user) throw new Error("Invalid credentials");

    // Support both bcrypt-hashed passwords and plaintext mock passwords
    let match = false;
    if (typeof user.password === 'string' && user.password.startsWith('$2')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = password === user.password;
    }

    if (!match) throw new Error("Invalid credentials");

    const payload = {
      id: user.id,
      email: user.email
    };

    const secret = config.jwtSecret;
    const expiresIn: jwt.SignOptions["expiresIn"] =
      (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "1h";
    console.log("JWT SIGN CALL IS RUNNING FROM:", __filename);

    const token = jwt.sign(payload, secret, { expiresIn });

    return { token };
  }
}
