import { NextResponse } from 'next/server';

/**
 * Piyasa verileri API — Canlı Veri
 *
 * - BIST Hisse: yahoo-finance2 (canlı)
 * - US Hisse & ETF: yahoo-finance2 (canlı)
 * - Döviz: finans.truncgil.com (canlı)
 * - Kripto: CoinGecko API (canlı)
 */

// --- Types ---
interface MarketResponse {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    type: 'stock' | 'etf' | 'gold' | 'forex' | 'crypto' | 'fund';
    sparkline: number[];
    isLive: boolean;
    market?: string;
    currency?: string;
}

// --- Turkish number parser ---
function parseTR(str: string): number {
    if (!str) return 0;
    return parseFloat(str.replace('$', '').trim().replace(/\./g, '').replace(',', '.')) || 0;
}

function parseChangePct(str: string): number {
    if (!str) return 0;
    return parseFloat(str.replace('%', '').replace(',', '.')) || 0;
}

// --- Yahoo Finance for BIST + US Stocks + ETFs + Funds ---
const BIST_SYMBOLS = [
    { yahoo: 'THYAO.IS', display: 'THYAO', name: 'Türk Hava Yolları' },
    { yahoo: 'ASELS.IS', display: 'ASELS', name: 'ASELSAN' },
    { yahoo: 'GARAN.IS', display: 'GARAN', name: 'Garanti BBVA' },
    { yahoo: 'AKBNK.IS', display: 'AKBNK', name: 'Akbank' },
    { yahoo: 'SISE.IS', display: 'SISE', name: 'Şişecam' },
    { yahoo: 'EREGL.IS', display: 'EREGL', name: 'Ereğli Demir Çelik' },
    { yahoo: 'TUPRS.IS', display: 'TUPRS', name: 'Tüpraş' },
    { yahoo: 'KCHOL.IS', display: 'KCHOL', name: 'Koç Holding' },
    { yahoo: 'SAHOL.IS', display: 'SAHOL', name: 'Sabancı Holding' },
    { yahoo: 'BIMAS.IS', display: 'BIMAS', name: 'BİM Mağazalar' },
];

const US_SYMBOLS = [
    { yahoo: 'AAPL', display: 'AAPL', name: 'Apple Inc.' },
    { yahoo: 'MSFT', display: 'MSFT', name: 'Microsoft' },
    { yahoo: 'GOOGL', display: 'GOOGL', name: 'Alphabet (Google)' },
    { yahoo: 'AMZN', display: 'AMZN', name: 'Amazon' },
    { yahoo: 'NVDA', display: 'NVDA', name: 'NVIDIA' },
    { yahoo: 'META', display: 'META', name: 'Meta Platforms' },
    { yahoo: 'TSLA', display: 'TSLA', name: 'Tesla' },
];

const ETF_SYMBOLS = [
    { yahoo: 'SPY', display: 'SPY', name: 'S&P 500 ETF' },
    { yahoo: 'QQQ', display: 'QQQ', name: 'Nasdaq 100 ETF' },
    { yahoo: 'VOO', display: 'VOO', name: 'Vanguard S&P 500' },
    { yahoo: 'VTI', display: 'VTI', name: 'Vanguard Total Market' },
    { yahoo: 'IWM', display: 'IWM', name: 'Russell 2000 ETF' },
];

// Note: TEFAS/BEFAS funds are not available via Yahoo Finance API
// A future integration with the TEFAS platform would be needed

async function fetchYahooQuotes(
    symbolDefs: typeof BIST_SYMBOLS,
    type: MarketResponse['type'],
    market?: string
): Promise<MarketResponse[]> {
    try {
        // Dynamic import for yahoo-finance2
        const YahooFinance = (await import('yahoo-finance2')).default;
        const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

        const yahooSymbols = symbolDefs.map(s => s.yahoo);
        const quotes = await yf.quote(yahooSymbols);

        const symbolMap = new Map(symbolDefs.map(s => [s.yahoo, s]));

        return (Array.isArray(quotes) ? quotes : [quotes])
            .filter(q => q && q.regularMarketPrice)
            .map(q => {
                const def = symbolMap.get(q.symbol);
                return {
                    symbol: def?.display || q.symbol.replace('.IS', ''),
                    name: def?.name || q.shortName || q.longName || q.symbol,
                    price: q.regularMarketPrice || 0,
                    change: q.regularMarketChange || 0,
                    changePercent: q.regularMarketChangePercent || 0,
                    type,
                    sparkline: [],
                    isLive: true,
                    market: market || (q.exchange || ''),
                    currency: q.currency || 'TRY',
                };
            });
    } catch (err) {
        console.error(`Yahoo Finance fetch error for ${type}:`, err);
        return [];
    }
}

// --- Döviz from truncgil ---
async function fetchForex(): Promise<MarketResponse[]> {
    try {
        const res = await fetch('https://finans.truncgil.com/today.json', {
            headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
            next: { revalidate: 120 },
        });
        if (!res.ok) return [];
        const data = await res.json();

        const forexMap: Record<string, string> = {
            'USD': 'ABD Doları',
            'EUR': 'Euro',
            'GBP': 'İngiliz Sterlini',
            'CHF': 'İsviçre Frangı',
        };

        return Object.entries(forexMap).map(([key, name]) => {
            const item = data[key];
            if (!item) return null;
            const buying = parseTR(item['Alış'] || '0');
            const selling = parseTR(item['Satış'] || '0');
            const changePct = parseChangePct(item['Değişim'] || '0');
            const midPrice = (buying + selling) / 2;
            const changeAbs = midPrice * (changePct / 100);

            return {
                symbol: `${key}/TRY`,
                name,
                price: midPrice,
                change: changeAbs,
                changePercent: changePct,
                type: 'forex' as const,
                sparkline: [],
                isLive: true,
                currency: 'TRY',
            };
        }).filter(Boolean) as MarketResponse[];
    } catch {
        return [];
    }
}

// --- Kripto from CoinGecko ---
async function fetchCrypto(): Promise<MarketResponse[]> {
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true',
            {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                next: { revalidate: 120 },
            }
        );
        if (!res.ok) return [];
        const data = await res.json();

        const cryptoMap: Record<string, { symbol: string; name: string }> = {
            bitcoin: { symbol: 'BTC/USD', name: 'Bitcoin' },
            ethereum: { symbol: 'ETH/USD', name: 'Ethereum' },
            binancecoin: { symbol: 'BNB/USD', name: 'BNB' },
            solana: { symbol: 'SOL/USD', name: 'Solana' },
            ripple: { symbol: 'XRP/USD', name: 'Ripple (XRP)' },
        };

        return Object.entries(cryptoMap)
            .filter(([id]) => data[id])
            .map(([id, meta]) => {
                const price = data[id].usd || 0;
                const changePct = data[id].usd_24h_change || 0;
                return {
                    symbol: meta.symbol,
                    name: meta.name,
                    price,
                    change: price * (changePct / 100),
                    changePercent: changePct,
                    type: 'crypto' as const,
                    sparkline: [],
                    isLive: true,
                    currency: 'USD',
                };
            });
    } catch {
        return [];
    }
}

export async function GET() {
    // Fetch everything in parallel
    const [bistStocks, usStocks, etfs, forex, crypto] = await Promise.all([
        fetchYahooQuotes(BIST_SYMBOLS, 'stock', 'BIST'),
        fetchYahooQuotes(US_SYMBOLS, 'stock', 'NASDAQ/NYSE'),
        fetchYahooQuotes(ETF_SYMBOLS, 'etf', 'US-ETF'),
        fetchForex(),
        fetchCrypto(),
    ]);

    const allData = [...bistStocks, ...usStocks, ...etfs, ...forex, ...crypto];
    const liveCount = allData.filter(d => d.isLive).length;

    return NextResponse.json({
        data: allData,
        updatedAt: new Date().toISOString(),
        source: liveCount > 0 ? 'live' : 'demo',
        counts: {
            bistStocks: bistStocks.length,
            usStocks: usStocks.length,
            etfs: etfs.length,
            forex: forex.length,
            crypto: crypto.length,
        },
    });
}
