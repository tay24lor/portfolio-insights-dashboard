"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeHolding = exports.patchHolding = exports.postHolding = exports.getHoldings = void 0;
const holdingsService = __importStar(require("../services/holdings.service"));
const isNonNegativeNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const readHoldingInput = (body, partial = false) => {
    const input = body;
    const result = {};
    if (!partial || input.symbol !== undefined) {
        if (typeof input.symbol !== 'string' || !/^[A-Za-z.]{1,12}$/.test(input.symbol.trim())) {
            throw new Error('A valid symbol is required.');
        }
        result.symbol = input.symbol.trim();
    }
    for (const field of ['shares', 'avg_price', 'current_price']) {
        if (!partial || input[field] !== undefined) {
            if (!isNonNegativeNumber(input[field]))
                throw new Error(`${field} must be a non-negative number.`);
            result[field] = input[field];
        }
    }
    return result;
};
const getHoldings = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const holdings = await holdingsService.fetchHoldings(userId);
        res.json(holdings);
    }
    catch (err) {
        next(err);
    }
};
exports.getHoldings = getHoldings;
const postHolding = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const holding = await holdingsService.createHolding(req.user.id, readHoldingInput(req.body));
        res.status(201).json(holding);
    }
    catch (err) {
        next(err);
    }
};
exports.postHolding = postHolding;
const patchHolding = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id < 1)
            return res.status(400).json({ message: 'Invalid holding id.' });
        const holding = await holdingsService.updateHolding(req.user.id, id, readHoldingInput(req.body, true));
        if (!holding)
            return res.status(404).json({ message: 'Holding not found.' });
        res.json(holding);
    }
    catch (err) {
        next(err);
    }
};
exports.patchHolding = patchHolding;
const removeHolding = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id < 1)
            return res.status(400).json({ message: 'Invalid holding id.' });
        const deleted = await holdingsService.deleteHolding(req.user.id, id);
        if (!deleted)
            return res.status(404).json({ message: 'Holding not found.' });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.removeHolding = removeHolding;
