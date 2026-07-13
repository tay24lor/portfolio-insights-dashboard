"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    static async register(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.register(email, password);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    }
}
exports.AuthController = AuthController;
