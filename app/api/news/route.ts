import { NextResponse } from 'next/server';

/**
 * Ekonomi Haberleri API
 * Google News RSS feeds for Turkish economy/finance
 */

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    category: string;
}

async function fetchGoogleNewsRSS(query: string, category: string): Promise<NewsItem[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=tr&gl=TR&ceid=TR:tr`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            },
            next: { revalidate: 600 }, // 10-minute cache
        });

        if (!res.ok) return [];

        const xml = await res.text();

        // Simple XML parsing for RSS
        const items: NewsItem[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
            const itemXml = match[1];
            const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
                || itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
            const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1]
                || itemXml.match(/<link\/>(.*?)(?=<)/)?.[1] || '';
            const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
            const source = itemXml.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || 'Google News';

            if (title && !title.includes('Google News')) {
                items.push({
                    title: title.replace(/<[^>]*>/g, '').trim(),
                    link: link.trim(),
                    pubDate,
                    source: source.replace(/<[^>]*>/g, '').trim(),
                    category,
                });
            }
        }

        return items;
    } catch (err) {
        console.error(`News fetch error for ${query}:`, err);
        return [];
    }
}

export async function GET() {
    // Fetch multiple categories in parallel
    const [ekonomi, borsa, doviz, kripto, altin] = await Promise.all([
        fetchGoogleNewsRSS('türkiye ekonomi finans', 'ekonomi'),
        fetchGoogleNewsRSS('BIST borsa hisse', 'borsa'),
        fetchGoogleNewsRSS('dolar euro kur döviz', 'doviz'),
        fetchGoogleNewsRSS('bitcoin kripto para', 'kripto'),
        fetchGoogleNewsRSS('altın fiyatı gram çeyrek', 'altin'),
    ]);

    const allNews = [...ekonomi, ...borsa, ...doviz, ...kripto, ...altin];

    // Deduplicate by title similarity
    const seen = new Set<string>();
    const deduped = allNews.filter(item => {
        const key = item.title.substring(0, 60).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sort by date (newest first)
    deduped.sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
    });

    return NextResponse.json({
        data: deduped,
        updatedAt: new Date().toISOString(),
        count: deduped.length,
    });
}
