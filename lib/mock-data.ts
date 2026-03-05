// ============================================================
// WealthPulse AI — Mock Data
// ============================================================

export interface Asset {
    id: string;
    symbol: string;
    name: string;
    type: 'stock' | 'etf' | 'gold' | 'forex' | 'crypto' | 'fund';
    quantity: number;
    avgCost: number;
    currentPrice: number;
    change24h: number;
    currency: string;
}

export interface Transaction {
    id: string;
    date: string;
    type: 'buy' | 'sell';
    symbol: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface MarketItem {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    type: 'stock' | 'etf' | 'gold' | 'forex' | 'crypto' | 'fund';
    sparkline: number[];
    isLive?: boolean;
    market?: string;
    currency?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

// Portfolio assets
export const portfolioAssets: Asset[] = [
    { id: '1', symbol: 'THYAO', name: 'Türk Hava Yolları', type: 'stock', quantity: 500, avgCost: 258.40, currentPrice: 312.80, change24h: 2.34, currency: 'TRY' },
    { id: '2', symbol: 'ASELS', name: 'ASELSAN', type: 'stock', quantity: 300, avgCost: 48.60, currentPrice: 57.20, change24h: -0.87, currency: 'TRY' },
    { id: '3', symbol: 'SISE', name: 'Şişecam', type: 'stock', quantity: 200, avgCost: 42.30, currentPrice: 49.10, change24h: 1.56, currency: 'TRY' },
    { id: '4', symbol: 'XAU/TRY', name: 'Altın (Gram)', type: 'gold', quantity: 50, avgCost: 2780, currentPrice: 3124.50, change24h: 0.42, currency: 'TRY' },
    { id: '5', symbol: 'USD/TRY', name: 'Amerikan Doları', type: 'forex', quantity: 5000, avgCost: 32.80, currentPrice: 36.42, change24h: -0.15, currency: 'TRY' },
    { id: '6', symbol: 'GARAN', name: 'Garanti BBVA', type: 'stock', quantity: 400, avgCost: 112.50, currentPrice: 138.40, change24h: 1.12, currency: 'TRY' },
    { id: '7', symbol: 'AKBNK', name: 'Akbank', type: 'stock', quantity: 600, avgCost: 52.30, currentPrice: 65.80, change24h: 0.76, currency: 'TRY' },
    { id: '8', symbol: 'EUR/TRY', name: 'Euro', type: 'forex', quantity: 2000, avgCost: 35.40, currentPrice: 39.18, change24h: 0.08, currency: 'TRY' },
    { id: '9', symbol: 'BTC', name: 'Bitcoin', type: 'crypto', quantity: 0.15, avgCost: 60000, currentPrice: 87500, change24h: 3.42, currency: 'USD' },
    { id: '10', symbol: 'TEFAS-GOLD', name: 'İstanbul Portföy Altın Fonu', type: 'fund', quantity: 1000, avgCost: 4.20, currentPrice: 5.85, change24h: 0.35, currency: 'TRY' },
];

// Recent transactions
export const recentTransactions: Transaction[] = [
    { id: 't1', date: '2026-03-04', type: 'buy', symbol: 'THYAO', name: 'Türk Hava Yolları', quantity: 100, price: 310.50, total: 31050 },
    { id: 't2', date: '2026-03-03', type: 'sell', symbol: 'SISE', name: 'Şişecam', quantity: 50, price: 48.90, total: 2445 },
    { id: 't3', date: '2026-03-03', type: 'buy', symbol: 'XAU/TRY', name: 'Altın (Gram)', quantity: 10, price: 3115.00, total: 31150 },
    { id: 't4', date: '2026-03-02', type: 'buy', symbol: 'GARAN', name: 'Garanti BBVA', quantity: 200, price: 136.80, total: 27360 },
    { id: 't5', date: '2026-03-01', type: 'sell', symbol: 'USD/TRY', name: 'Amerikan Doları', quantity: 1000, price: 36.30, total: 36300 },
    { id: 't6', date: '2026-02-28', type: 'buy', symbol: 'AKBNK', name: 'Akbank', quantity: 300, price: 64.20, total: 19260 },
    { id: 't7', date: '2026-02-27', type: 'buy', symbol: 'ASELS', name: 'ASELSAN', quantity: 100, price: 56.40, total: 5640 },
    { id: 't8', date: '2026-02-26', type: 'buy', symbol: 'BTC', name: 'Bitcoin', quantity: 0.05, price: 85200, total: 4260 },
];

// Market data
export const marketData: MarketItem[] = [
    { symbol: 'THYAO', name: 'Türk Hava Yolları', price: 312.80, change: 7.15, changePercent: 2.34, type: 'stock', sparkline: [290, 295, 298, 302, 305, 299, 303, 308, 312, 310, 314, 312.8] },
    { symbol: 'ASELS', name: 'ASELSAN', price: 57.20, change: -0.50, changePercent: -0.87, type: 'stock', sparkline: [55, 56, 57.5, 58, 57, 56.5, 57.8, 57.7, 56.9, 57.5, 57, 57.2] },
    { symbol: 'SISE', name: 'Şişecam', price: 49.10, change: 0.75, changePercent: 1.56, type: 'stock', sparkline: [46, 46.5, 47, 47.8, 48, 47.5, 48.2, 48.5, 49, 48.8, 49.2, 49.1] },
    { symbol: 'GARAN', name: 'Garanti BBVA', price: 138.40, change: 1.53, changePercent: 1.12, type: 'stock', sparkline: [132, 134, 133, 135, 136, 137, 136.5, 137.5, 138, 137.8, 139, 138.4] },
    { symbol: 'AKBNK', name: 'Akbank', price: 65.80, change: 0.50, changePercent: 0.76, type: 'stock', sparkline: [62, 63, 63.5, 64, 63.8, 64.5, 65, 64.8, 65.3, 65.5, 66, 65.8] },
    { symbol: 'EREGL', name: 'Ereğli Demir Çelik', price: 52.30, change: -0.40, changePercent: -0.76, type: 'stock', sparkline: [51, 52, 53, 52.5, 52.8, 52, 51.5, 52.3, 53, 52.7, 52.5, 52.3] },
    { symbol: 'TUPRS', name: 'Tüpraş', price: 185.60, change: 3.20, changePercent: 1.75, type: 'stock', sparkline: [178, 180, 179, 181, 183, 182, 184, 183, 185, 184, 186, 185.6] },
    { symbol: 'XAU/TRY', name: 'Altın (Gram TL)', price: 3124.50, change: 13.05, changePercent: 0.42, type: 'gold', sparkline: [3050, 3060, 3075, 3090, 3085, 3095, 3100, 3110, 3105, 3115, 3120, 3124.5] },
    { symbol: 'XAU/USD', name: 'Altın (Ons USD)', price: 2875.30, change: -8.50, changePercent: -0.30, type: 'gold', sparkline: [2860, 2870, 2880, 2885, 2878, 2882, 2875, 2880, 2872, 2878, 2876, 2875.3] },
    { symbol: 'USD/TRY', name: 'ABD Doları', price: 36.42, change: -0.05, changePercent: -0.15, type: 'forex', sparkline: [36.2, 36.3, 36.4, 36.5, 36.45, 36.48, 36.42, 36.44, 36.40, 36.43, 36.41, 36.42] },
    { symbol: 'EUR/TRY', name: 'Euro', price: 39.18, change: 0.03, changePercent: 0.08, type: 'forex', sparkline: [38.9, 39.0, 39.1, 39.05, 39.12, 39.08, 39.15, 39.18, 39.10, 39.14, 39.16, 39.18] },
    { symbol: 'GBP/TRY', name: 'İngiliz Sterlini', price: 46.25, change: 0.18, changePercent: 0.39, type: 'forex', sparkline: [45.8, 45.9, 46.0, 46.1, 46.0, 46.15, 46.2, 46.1, 46.18, 46.22, 46.25, 46.25] },
    { symbol: 'BTC/USD', name: 'Bitcoin', price: 87500, change: 2890, changePercent: 3.42, type: 'crypto', sparkline: [82000, 83000, 84000, 83500, 85000, 84500, 86000, 85500, 87000, 86500, 88000, 87500] },
    { symbol: 'ETH/USD', name: 'Ethereum', price: 3240, change: 85, changePercent: 2.69, type: 'crypto', sparkline: [3050, 3080, 3100, 3060, 3120, 3150, 3130, 3180, 3200, 3210, 3250, 3240] },
];

// 30-day portfolio value history
export function generatePortfolioHistory(days: number = 30): { date: string; value: number }[] {
    const history: { date: string; value: number }[] = [];
    const baseValue = 680000;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const noise = (Math.random() - 0.45) * 15000;
        const trend = ((days - i) / days) * 45000;
        const value = baseValue + trend + noise;
        history.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100,
        });
    }
    return history;
}

// Portfolio distribution for pie chart
export function getPortfolioDistribution() {
    const totalValue = portfolioAssets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
    const categories: Record<string, number> = {};

    portfolioAssets.forEach(asset => {
        const label =
            asset.type === 'stock' ? 'Hisse Senedi' :
                asset.type === 'gold' ? 'Altın' :
                    asset.type === 'forex' ? 'Döviz' :
                        asset.type === 'crypto' ? 'Kripto' :
                            asset.type === 'fund' ? 'Fon' :
                                asset.type === 'etf' ? 'ETF' : 'Diğer';

        const value = asset.quantity * asset.currentPrice;
        categories[label] = (categories[label] || 0) + value;
    });

    return Object.entries(categories).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        percentage: Math.round((value / totalValue) * 10000) / 100,
    }));
}

// Calculate total portfolio value
export function getTotalPortfolioValue(): number {
    return portfolioAssets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
}

// Calculate daily P&L
export function getDailyPnL(): { value: number; percentage: number } {
    let totalCurrent = 0;
    let totalPrevious = 0;

    portfolioAssets.forEach(a => {
        const current = a.quantity * a.currentPrice;
        const prev = current / (1 + a.change24h / 100);
        totalCurrent += current;
        totalPrevious += prev;
    });

    const pnl = totalCurrent - totalPrevious;
    const pct = (pnl / totalPrevious) * 100;

    return {
        value: Math.round(pnl * 100) / 100,
        percentage: Math.round(pct * 100) / 100,
    };
}

// Best and worst performers
export function getTopPerformers() {
    const sorted = [...portfolioAssets].sort((a, b) => b.change24h - a.change24h);
    return {
        best: sorted[0],
        worst: sorted[sorted.length - 1],
    };
}

// Monte Carlo simulation
export interface SimulationResult {
    scenarios: { month: number; values: number[] }[];
    percentiles: { month: number; p10: number; p50: number; p90: number }[];
    finalValues: number[];
}

export function runMonteCarloSimulation(
    initialBalance: number,
    years: number,
    expectedReturn: number,
    volatility: number,
    numSimulations: number = 500
): SimulationResult {
    const months = years * 12;
    const monthlyReturn = expectedReturn / 12 / 100;
    const monthlyVol = volatility / Math.sqrt(12) / 100;

    const allPaths: number[][] = [];

    for (let s = 0; s < numSimulations; s++) {
        const path: number[] = [initialBalance];
        let value = initialBalance;
        for (let m = 1; m <= months; m++) {
            const z = gaussianRandom();
            value *= Math.exp((monthlyReturn - 0.5 * monthlyVol ** 2) + monthlyVol * z);
            path.push(Math.round(value));
        }
        allPaths.push(path);
    }

    const scenarios: { month: number; values: number[] }[] = [];
    const percentiles: { month: number; p10: number; p50: number; p90: number }[] = [];

    for (let m = 0; m <= months; m++) {
        const vals = allPaths.map(p => p[m]).sort((a, b) => a - b);
        scenarios.push({ month: m, values: vals.slice(0, 10) }); // Keep only 10 for display
        percentiles.push({
            month: m,
            p10: vals[Math.floor(numSimulations * 0.1)],
            p50: vals[Math.floor(numSimulations * 0.5)],
            p90: vals[Math.floor(numSimulations * 0.9)],
        });
    }

    const finalValues = allPaths.map(p => p[months]);

    return { scenarios, percentiles, finalValues };
}

function gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// AI chat initial messages
export const initialChatMessages: ChatMessage[] = [
    {
        id: 'msg1',
        role: 'assistant',
        content: '👋 Merhaba! Ben WealthPulse AI Danışmanınızım. Portföyünüz hakkında sorularınızı yanıtlayabilir, piyasa analizi yapabilir ve yatırım stratejileri hakkında bilgi verebilirim.\n\n**Not:** Verdiğim bilgiler yatırım tavsiyesi niteliğinde değildir.',
        timestamp: new Date().toISOString(),
    },
];

// Format helpers
export function formatCurrency(value: number, currency = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
