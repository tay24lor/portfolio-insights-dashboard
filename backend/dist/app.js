"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const holdings_routes_1 = __importDefault(require("./routes/holdings.routes"));
const portfolio_routes_1 = __importDefault(require("./routes/portfolio.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/holdings', holdings_routes_1.default);
app.use('/api/portfolio', portfolio_routes_1.default);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
