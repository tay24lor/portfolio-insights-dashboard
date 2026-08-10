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
exports.getTransactions = exports.getWatchlist = exports.getRebalancing = exports.getRisk = exports.getCashflow = exports.getBenchmark = exports.getPerformance = exports.getSummary = void 0;
const portfolioService = __importStar(require("../services/portfolio.service"));
const getSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const summary = await portfolioService.fetchSummary(userId);
        res.json(summary);
    }
    catch (err) {
        next(err);
    }
};
exports.getSummary = getSummary;
const getPerformance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const range = req.query.range || '1Y';
        const performance = await portfolioService.fetchPerformance(userId, range);
        res.json(performance);
    }
    catch (err) {
        next(err);
    }
};
exports.getPerformance = getPerformance;
const getBenchmark = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const benchmark = await portfolioService.fetchBenchmark(userId);
        res.json(benchmark);
    }
    catch (err) {
        next(err);
    }
};
exports.getBenchmark = getBenchmark;
const getCashflow = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cashflow = await portfolioService.fetchCashflow(userId);
        res.json(cashflow);
    }
    catch (err) {
        next(err);
    }
};
exports.getCashflow = getCashflow;
const getRisk = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const risk = await portfolioService.fetchRisk(userId);
        res.json(risk);
    }
    catch (err) {
        next(err);
    }
};
exports.getRisk = getRisk;
const getRebalancing = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const recommendations = await portfolioService.fetchRecommendations(userId);
        res.json(recommendations);
    }
    catch (err) {
        next(err);
    }
};
exports.getRebalancing = getRebalancing;
const getWatchlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const watchlist = await portfolioService.fetchWatchlist(userId);
        res.json(watchlist);
    }
    catch (err) {
        next(err);
    }
};
exports.getWatchlist = getWatchlist;
const getTransactions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const transactions = await portfolioService.fetchTransactions(userId);
        res.json(transactions);
    }
    catch (err) {
        next(err);
    }
};
exports.getTransactions = getTransactions;
