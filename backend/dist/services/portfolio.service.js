"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTransactions = exports.fetchWatchlist = exports.fetchRecommendations = exports.fetchRisk = exports.fetchCashflow = exports.fetchBenchmark = exports.fetchPerformance = exports.fetchSummary = void 0;
const mock_db_1 = require("../mock/mock.db");
const fetchSummary = async (userId) => {
    const summary = await mock_db_1.mockDb.getPortfolioSummary(userId);
    const holdings = await mock_db_1.mockDb.getHoldingsByUserId(userId);
    const totalValue = holdings.reduce((sum, holding) => sum + holding.shares * holding.current_price, 0);
    const allocation = holdings
        .map((holding) => {
        const value = holding.shares * holding.current_price;
        return {
            symbol: holding.symbol,
            value,
            percentage: totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0
        };
    })
        .sort((a, b) => b.value - a.value);
    return {
        ...summary,
        allocation
    };
};
exports.fetchSummary = fetchSummary;
const fetchPerformance = async (userId, range = '1Y') => {
    const summary = await mock_db_1.mockDb.getPortfolioSummary(userId);
    const costBasis = summary.total_value * 0.9;
    const totalReturn = summary.total_value - costBasis;
    const returnRate = Number((((summary.total_value - costBasis) / costBasis) * 100).toFixed(1));
    const trendMap = {
        '1M': [
            { label: 'W1', value: 60 },
            { label: 'W2', value: 61 },
            { label: 'W3', value: 72 },
            { label: 'W4', value: 78 }
        ],
        '3M': [
            { label: 'Jun', value: 82 },
            { label: 'Jul', value: 88 },
            { label: 'Aug', value: 92 }
        ],
        YTD: [
            { label: 'Jan', value: 50 },
            { label: 'Feb', value: 55 },
            { label: 'Mar', value: 62 },
            { label: 'Apr', value: 72 },
            { label: 'May', value: 75 },
            { label: 'Jun', value: 80 },
            { label: 'Jul', value: 88 },
            { label: 'Aug', value: 92 }
        ],
        '1Y': [
            { label: 'Jan', value: 50 },
            { label: 'Feb', value: 58 },
            { label: 'Mar', value: 63 },
            { label: 'Apr', value: 70 },
            { label: 'May', value: 75 },
            { label: 'Jun', value: 84 },
            { label: 'Jul', value: 88 },
            { label: 'Aug', value: 90 },
            { label: 'Sep', value: 94 },
            { label: 'Oct', value: 96 },
            { label: 'Nov', value: 98 },
            { label: 'Dec', value: 100 }
        ]
    };
    const trend = trendMap[range] ?? trendMap['1Y'];
    return {
        total_return: totalReturn,
        return_rate: returnRate,
        trend
    };
};
exports.fetchPerformance = fetchPerformance;
const fetchBenchmark = async (userId) => {
    const summary = await mock_db_1.mockDb.getPortfolioSummary(userId);
    const portfolioReturn = Number((((summary.total_value - (summary.total_value * 0.9)) / (summary.total_value * 0.9)) * 100).toFixed(1));
    return {
        benchmark_name: 'S&P 500',
        benchmark_return: 11.5,
        portfolio_return: portfolioReturn,
        difference: Number((portfolioReturn - 11.5).toFixed(1)),
        status: portfolioReturn >= 11.5 ? 'Outperforming' : 'Lagging'
    };
};
exports.fetchBenchmark = fetchBenchmark;
const fetchCashflow = async (userId) => {
    const summary = await mock_db_1.mockDb.getPortfolioSummary(userId);
    const availableCash = Math.round(summary.total_value * 0.06);
    const monthlyIncome = Math.round(summary.total_value * 0.018);
    const monthlySpend = Math.round(summary.total_value * 0.01);
    return {
        available_cash: availableCash,
        monthly_income: monthlyIncome,
        monthly_spend: monthlySpend,
        monthly_net: Number((monthlyIncome - monthlySpend).toFixed(2)),
        forecast: [
            { month: 'Aug', inflow: monthlyIncome, outflow: monthlySpend, net: monthlyIncome - monthlySpend },
            { month: 'Sep', inflow: monthlyIncome + 250, outflow: monthlySpend + 120, net: (monthlyIncome + 250) - (monthlySpend + 120) },
            { month: 'Oct', inflow: monthlyIncome + 340, outflow: monthlySpend + 145, net: (monthlyIncome + 340) - (monthlySpend + 145) },
            { month: 'Nov', inflow: monthlyIncome + 420, outflow: monthlySpend + 170, net: (monthlyIncome + 420) - (monthlySpend + 170) },
            { month: 'Dec', inflow: monthlyIncome + 510, outflow: monthlySpend + 230, net: (monthlyIncome + 510) - (monthlySpend + 230) },
            { month: 'Jan', inflow: monthlyIncome + 600, outflow: monthlySpend + 280, net: (monthlyIncome + 600) - (monthlySpend + 280) }
        ]
    };
};
exports.fetchCashflow = fetchCashflow;
const fetchRisk = async (userId) => {
    const holdings = await mock_db_1.mockDb.getHoldingsByUserId(userId);
    if (!holdings.length) {
        return {
            risk_level: 'Low',
            concentration_pct: 0,
            diversification_score: 100,
            largest_position_symbol: 'N/A',
            largest_position_value: 0
        };
    }
    const totalValue = holdings.reduce((sum, holding) => sum + holding.shares * holding.current_price, 0);
    const allocation = holdings.map((holding) => {
        const value = holding.shares * holding.current_price;
        return {
            symbol: holding.symbol,
            value,
            percentage: totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0
        };
    });
    const topPosition = allocation.reduce((max, item) => item.value > max.value ? item : max, allocation[0]);
    const concentrationPct = Number(((topPosition.value / totalValue) * 100).toFixed(1));
    const diversificationScore = Math.max(0, Number((100 - concentrationPct).toFixed(1)));
    const riskLevel = concentrationPct >= 45
        ? 'High'
        : concentrationPct >= 30
            ? 'Elevated'
            : concentrationPct >= 20
                ? 'Moderate'
                : 'Low';
    return {
        risk_level: riskLevel,
        concentration_pct: concentrationPct,
        diversification_score: diversificationScore,
        largest_position_symbol: topPosition.symbol,
        largest_position_value: topPosition.value
    };
};
exports.fetchRisk = fetchRisk;
const fetchRecommendations = async (userId) => {
    const holdings = await mock_db_1.mockDb.getHoldingsByUserId(userId);
    if (!holdings.length) {
        return {
            recommendations: []
        };
    }
    const totalValue = holdings.reduce((sum, holding) => sum + holding.shares * holding.current_price, 0);
    const targetBySymbol = {
        AAPL: 35,
        MSFT: 35,
        GOOGL: 30
    };
    const allocation = holdings.map((holding) => {
        const value = holding.shares * holding.current_price;
        return {
            symbol: holding.symbol,
            value,
            percentage: totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0
        };
    });
    const recommendations = allocation.map((item) => {
        const targetPct = targetBySymbol[item.symbol] ?? 20;
        const deltaPct = Number((targetPct - item.percentage).toFixed(1));
        if (Math.abs(deltaPct) < 1) {
            return {
                symbol: item.symbol,
                current_pct: item.percentage,
                target_pct: targetPct,
                action: 'Hold',
                delta_pct: 0
            };
        }
        return {
            symbol: item.symbol,
            current_pct: item.percentage,
            target_pct: targetPct,
            action: deltaPct > 0 ? 'Add' : 'Trim',
            delta_pct: Math.abs(deltaPct)
        };
    });
    return {
        recommendations
    };
};
exports.fetchRecommendations = fetchRecommendations;
const fetchWatchlist = async (userId) => {
    const holdings = await mock_db_1.mockDb.getHoldingsByUserId(userId);
    if (!holdings.length) {
        return [];
    }
    const targetMap = {
        AAPL: 190,
        MSFT: 340,
        GOOGL: 1500
    };
    return holdings.map((holding) => {
        const target = targetMap[holding.symbol] ?? holding.current_price;
        const delta = holding.current_price - target;
        return {
            symbol: holding.symbol,
            current_price: holding.current_price,
            target_price: target,
            direction: delta > 0 ? 'Up' : delta < 0 ? 'Down' : 'Flat',
            alert_active: Math.abs(delta) >= 15
        };
    });
};
exports.fetchWatchlist = fetchWatchlist;
const fetchTransactions = async (userId) => {
    const holdings = await mock_db_1.mockDb.getHoldingsByUserId(userId);
    const amount = holdings.length ? holdings.reduce((sum, holding) => sum + holding.shares * holding.current_price, 0) : 0;
    return [
        {
            id: 1,
            type: 'Buy',
            symbol: 'AAPL',
            amount: 1800,
            date: '2026-08-10',
            description: 'AAPL buy order executed'
        },
        {
            id: 2,
            type: 'Dividend',
            symbol: 'MSFT',
            amount: 82.5,
            date: '2026-08-01',
            description: 'MSFT dividend received'
        },
        {
            id: 3,
            type: 'Deposit',
            amount: 5000,
            date: '2026-07-24',
            description: 'Cash deposit'
        },
        {
            id: 4,
            type: 'Buy',
            symbol: 'GOOGL',
            amount: Math.round(amount * 0.1),
            date: '2026-07-12',
            description: 'GOOGL purchase'
        }
    ];
};
exports.fetchTransactions = fetchTransactions;
