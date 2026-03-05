import { NextResponse } from 'next/server';

/**
 * Altın fiyatları — Kuyumcular Odası verisi
 * Kaynak: finans.truncgil.com (Kuyumcular Odası fiyatlarını yansıtır)
 * Gram Altın, Çeyrek, Yarım, Tam, Cumhuriyet, 22 Ayar Bilezik, 24 Ayar (Has) Altın
 */

interface GoldPrice {
    name: string;
    buying: number;
    selling: number;
    change: number;
    changePercent: number;
    type: 'gold';
}

function parseTurkishNumber(str: string): number {
    if (!str) return 0;
    // Remove $ prefix if present, handle Turkish number format: 7.324,07 → 7324.07
    const cleaned = str.replace('$', '').trim();
    // Remove dots (thousand separators) and replace comma with dot (decimal)
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
}

function parseChangePercent(str: string): number {
    if (!str) return 0;
    return parseFloat(str.replace('%', '').replace(',', '.')) || 0;
}

async function fetchFromTruncgil(): Promise<{ gold: GoldPrice[]; updateDate: string }> {
    try {
        const res = await fetch('https://finans.truncgil.com/today.json', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            },
            next: { revalidate: 120 }, // 2-minute cache
        });

        if (!res.ok) return { gold: [], updateDate: '' };
        const data = await res.json();

        const goldMapping: Record<string, string> = {
            'gram-altin': 'Gram Altın',
            'ceyrek-altin': 'Çeyrek Altın',
            'yarim-altin': 'Yarım Altın',
            'tam-altin': 'Tam Altın',
            'cumhuriyet-altini': 'Cumhuriyet Altını',
            '22-ayar-bilezik': '22 Ayar Bilezik',
            'gram-has-altin': '24 Ayar Has Altın',
            'ata-altin': 'Ata Altın',
            'resat-altin': 'Reşat Altın',
            'ons': 'Ons Altın (USD)',
        };

        const goldResults: GoldPrice[] = [];

        for (const [key, name] of Object.entries(goldMapping)) {
            const item = data[key];
            if (!item) continue;

            const buying = parseTurkishNumber(item['Alış'] || item['Alis'] || '0');
            const selling = parseTurkishNumber(item['Satış'] || item['Satis'] || '0');
            const changePercent = parseChangePercent(item['Değişim'] || item['Degisim'] || '0');
            const change = buying * (changePercent / 100);

            if (selling > 0) {
                goldResults.push({
                    name,
                    buying,
                    selling,
                    change,
                    changePercent,
                    type: 'gold',
                });
            }
        }

        return {
            gold: goldResults,
            updateDate: data['Update_Date'] || '',
        };
    } catch (err) {
        console.error('Truncgil fetch error:', err);
        return { gold: [], updateDate: '' };
    }
}

export async function GET() {
    const { gold, updateDate } = await fetchFromTruncgil();

    return NextResponse.json({
        data: gold,
        updatedAt: updateDate || new Date().toISOString(),
        source: gold.length > 0 ? 'kuyumcular-odasi' : 'unavailable',
    });
}
