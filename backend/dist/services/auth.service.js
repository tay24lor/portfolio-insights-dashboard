"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const mock_db_1 = require("../mock/mock.db");
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("../config/env");
dotenv_1.default.config();
class AuthService {
    async register(email, password) {
        const existing = User_1.users.find(u => u.email === email);
        if (existing)
            throw new Error("User already exists");
        const hashed = await bcrypt_1.default.hash(password, 10);
        const newUser = {
            id: User_1.users.length + 1,
            email,
            password: hashed
        };
        User_1.users.push(newUser);
        return { message: "User registered successfully" };
    }
    async login(email, password) {
        let user = User_1.users.find(u => u.email === email) ?? null;
        // Fallback to mock DB for development/testing
        if (!user) {
            const maybe = (await mock_db_1.mockDb.getUserByEmail(email));
            if (maybe)
                user = maybe;
        }
        if (!user)
            throw new Error("Invalid credentials");
        // Support both bcrypt-hashed passwords and plaintext mock passwords
        let match = false;
        if (typeof user.password === 'string' && user.password.startsWith('$2')) {
            match = await bcrypt_1.default.compare(password, user.password);
        }
        else {
            match = password === user.password;
        }
        if (!match)
            throw new Error("Invalid credentials");
        const payload = {
            id: user.id,
            email: user.email
        };
        const secret = env_1.config.jwtSecret;
        const expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";
        console.log("JWT SIGN CALL IS RUNNING FROM:", __filename);
        const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
        return { token };
    }
}
exports.AuthService = AuthService;
