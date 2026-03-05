'use client';

import { useState, useEffect, useCallback } from 'react';
import { SimpleGrid, Text, Stack, TextInput, SegmentedControl, Group, Badge, Loader, Tooltip, ActionIcon, Paper, Table } from '@mantine/core';
import { IconSearch, IconArrowUpRight, IconArrowDownRight, IconRefresh } from '@tabler/icons-react';
import {
    LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { MarketItem, formatCurrency, formatPercent, marketData as fallbackData } from '@/lib/mock-data';

interface GoldPrice {
    name: string;
    buying: number;
    selling: number;
    change: number;
    changePercent: number;
    type: 'gold';
}

function SparklineChart({ data, color }: { data: number[]; color: string }) {
    const chartData = data.map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart data={chartData}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        stock: 'HİSSE',
        etf: 'ETF',
        gold: 'ALTIN',
        forex: 'DÖVİZ',
        crypto: 'KRİPTO',
        fund: 'FON',
    };
    return labels[type] || 'DİĞER';
}

function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
        stock: 'blue',
        etf: 'indigo',
        gold: 'yellow',
        forex: 'teal',
        crypto: 'grape',
        fund: 'cyan',
    };
    return colors[type] || 'gray';
}

function MarketCard({ item }: { item: MarketItem }) {
    const isPositive = item.change >= 0;
    const changeColor = isPositive ? '#22c55e' : '#ef4444';
    const isTRY = !item.currency || item.currency === 'TRY';

    return (
        <div className="market-card">
            <Group justify="space-between" mb={8}>
                <div>
                    <Group gap={6}>
                        <Text fw={700} size="md">{item.symbol}</Text>
                        {item.market && (
                            <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>{item.market}</Text>
                        )}
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={1}>{item.name}</Text>
                </div>
                <Badge size="xs" variant="light" color={getTypeColor(item.type)}>
                    {getTypeLabel(item.type)}
                </Badge>
            </Group>

            {item.sparkline && item.sparkline.length > 1 && (
                <SparklineChart data={item.sparkline} color={changeColor} />
            )}

            <Group justify="space-between" mt={8}>
                <Text fw={800} size="lg">
                    {isTRY ? formatCurrency(item.price) : `$${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </Text>
                <Group gap={4}>
                    {isPositive ? <IconArrowUpRight size={14} color={changeColor} /> : <IconArrowDownRight size={14} color={changeColor} />}
                    <Text size="sm" fw={600} c={isPositive ? 'green' : 'red'}>
                        {formatPercent(item.changePercent)}
                    </Text>
                </Group>
            </Group>
        </div>
    );
}

const filters = [
    { label: 'Tümü', value: 'all' },
    { label: 'BIST', value: 'bist' },
    { label: 'US', value: 'us' },
    { label: 'ETF', value: 'etf' },
    { label: 'Altın', value: 'gold' },
    { label: 'Döviz', value: 'forex' },
    { label: 'Kripto', value: 'crypto' },
    { label: 'Fonlar', value: 'fund' },
];

export default function MarketsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [data, setData] = useState<MarketItem[]>(fallbackData);
    const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [goldLive, setGoldLive] = useState(false);

    const fetchLiveData = useCallback(async () => {
        setLoading(true);

        const [marketRes, goldRes] = await Promise.allSettled([
            fetch('/api/markets'),
            fetch('/api/gold'),
        ]);

        // Market data
        try {
            if (marketRes.status === 'fulfilled' && marketRes.value.ok) {
                const json = await marketRes.value.json();
                if (json.data && json.data.length > 0) {
                    setData(json.data);
                    setLastUpdated(new Date(json.updatedAt).toLocaleTimeString('tr-TR'));
                    setIsLive(true);
                } else {
                    setData(fallbackData);
                    setIsLive(false);
                }
            } else {
                setData(fallbackData);
                setIsLive(false);
            }
        } catch {
            setData(fallbackData);
            setIsLive(false);
        }

        // Gold prices
        try {
            if (goldRes.status === 'fulfilled' && goldRes.value.ok) {
                const json = await goldRes.value.json();
                if (json.data && json.data.length > 0) {
                    setGoldPrices(json.data);
                    setGoldLive(true);
                }
            }
        } catch {
            setGoldLive(false);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 120_000);
        return () => clearInterval(interval);
    }, [fetchLiveData]);

    // Filter logic
    const filtered = data.filter(item => {
        if (filter === 'gold') return false; // Gold tab shows Kuyumcular Odası
        const matchesSearch = item.symbol.toLowerCase().includes(search.toLowerCase()) ||
            item.name.toLowerCase().includes(search.toLowerCase());

        let matchesFilter = true;
        const m = item.market || '';
        if (filter === 'bist') {
            matchesFilter = item.type === 'stock' && (m === 'BIST' || m.includes('IST') || m === '');
        } else if (filter === 'us') {
            matchesFilter = item.type === 'stock' && (m === 'NASDAQ/NYSE' || m.includes('NAS') || m.includes('NYS') || m.includes('NMS'));
        } else if (filter === 'all') {
            matchesFilter = true;
        } else {
            matchesFilter = item.type === filter;
        }

        return matchesSearch && matchesFilter;
    });

    const showGoldSection = filter === 'all' || filter === 'gold';
    const filteredGold = goldPrices.filter(g =>
        search === '' || g.name.toLowerCase().includes(search.toLowerCase())
    );

    // Group items by market for display
    const bistItems = filtered.filter(i => { const mk = i.market || ''; return i.type === 'stock' && (mk === 'BIST' || mk.includes('IST') || (mk === '' && (!i.currency || i.currency === 'TRY'))); });
    const usItems = filtered.filter(i => { const mk = i.market || ''; return (i.type === 'stock' && (mk === 'NASDAQ/NYSE' || mk.includes('NAS') || mk.includes('NYS') || mk.includes('NMS'))) || i.type === 'etf'; });
    const fundItems = filtered.filter(i => i.type === 'fund');
    const forexItems = filtered.filter(i => i.type === 'forex');
    const cryptoItems = filtered.filter(i => i.type === 'crypto');

    const showAll = filter === 'all';

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Text size="xl" fw={800}>Piyasalar</Text>
                <Group gap="xs">
                    {isLive ? (
                        <Badge color="green" variant="dot" size="sm">
                            Canlı · {lastUpdated}
                        </Badge>
                    ) : (
                        <Badge color="yellow" variant="dot" size="sm">
                            Demo Veri
                        </Badge>
                    )}
                    <Tooltip label="Verileri yenile">
                        <ActionIcon variant="subtle" color="gray" onClick={fetchLiveData} loading={loading} size="sm">
                            <IconRefresh size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <Group gap="md" wrap="wrap">
                <TextInput
                    placeholder="Sembol veya isim ara..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                    styles={{
                        input: {
                            background: 'var(--wp-bg-card)',
                            border: '1px solid var(--wp-border)',
                        },
                    }}
                />
                <SegmentedControl
                    value={filter}
                    onChange={setFilter}
                    data={filters}
                    size="sm"
                    styles={{
                        root: { background: 'var(--wp-bg-card)' },
                    }}
                />
            </Group>

            {loading && data.length === 0 ? (
                <Group justify="center" mt="xl">
                    <Loader size="lg" />
                    <Text c="dimmed">Piyasa verileri yükleniyor...</Text>
                </Group>
            ) : (
                <Stack gap="xl">
                    {/* BIST Hisse */}
                    {(showAll || filter === 'bist') && bistItems.length > 0 && (
                        <div>
                            <Group gap={8} mb="sm">
                                <Text size="md" fw={700}>🇹🇷 BIST Hisseler</Text>
                                <Badge size="xs" color="blue" variant="light">{bistItems.length} hisse</Badge>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                                {bistItems.map(item => <MarketCard key={item.symbol} item={item} />)}
                            </SimpleGrid>
                        </div>
                    )}

                    {/* Gold Section — Kuyumcular Odası */}
                    {showGoldSection && filteredGold.length > 0 && (
                        <Paper
                            p="lg"
                            radius="md"
                            style={{
                                background: 'var(--wp-bg-card)',
                                border: '1px solid var(--wp-border)',
                            }}
                        >
                            <Group justify="space-between" mb="md">
                                <Group gap={8}>
                                    <Text size="lg" fw={700}>🪙 Altın Fiyatları</Text>
                                    <Text size="xs" c="dimmed">Kuyumcular Odası</Text>
                                </Group>
                                {goldLive ? (
                                    <Badge color="green" variant="dot" size="xs">Canlı</Badge>
                                ) : (
                                    <Badge color="yellow" variant="dot" size="xs">Yüklenemedi</Badge>
                                )}
                            </Group>
                            <Table.ScrollContainer minWidth={500}>
                                <Table
                                    highlightOnHover
                                    styles={{
                                        th: { color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
                                        td: { fontSize: 13, padding: '10px 12px', borderBottom: '1px solid var(--wp-border)' },
                                    }}
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Altın Türü</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Alış</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Satış</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Değişim</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredGold.map(gold => {
                                            const isPositive = gold.change >= 0;
                                            return (
                                                <Table.Tr key={gold.name}>
                                                    <Table.Td>
                                                        <Group gap={8}>
                                                            <Text size="lg">🪙</Text>
                                                            <Text fw={600} size="sm">{gold.name}</Text>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }} fw={600}>
                                                        {formatCurrency(gold.buying)}
                                                    </Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }}>
                                                        <Text c="blue" fw={700} size="sm">{formatCurrency(gold.selling)}</Text>
                                                    </Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }}>
                                                        <Group gap={4} justify="flex-end">
                                                            {isPositive
                                                                ? <IconArrowUpRight size={14} color="#22c55e" />
                                                                : <IconArrowDownRight size={14} color="#ef4444" />
                                                            }
                                                            <Text fw={600} size="sm" c={isPositive ? 'green' : 'red'}>
                                                                {formatPercent(gold.changePercent)}
                                                            </Text>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Paper>
                    )}

                    {/* US Stocks + ETFs */}
                    {(showAll || filter === 'us' || filter === 'etf') && usItems.length > 0 && (
                        <div>
                            <Group gap={8} mb="sm">
                                <Text size="md" fw={700}>🇺🇸 US Hisseler & ETF&apos;ler</Text>
                                <Badge size="xs" color="indigo" variant="light">{usItems.length} varlık</Badge>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                                {usItems.map(item => <MarketCard key={item.symbol} item={item} />)}
                            </SimpleGrid>
                        </div>
                    )}                    {/* TEFAS Funds */}
                    {(showAll || filter === 'fund') && fundItems.length > 0 && (
                        <div>
                            <Group gap={8} mb="sm">
                                <Text size="md" fw={700}>📈 TEFAS Fonları</Text>
                                <Badge size="xs" color="cyan" variant="light">{fundItems.length} fon</Badge>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                                {fundItems.map(item => <MarketCard key={item.symbol} item={item} />)}
                            </SimpleGrid>
                        </div>
                    )}

                    {/* Forex */}
                    {(showAll || filter === 'forex') && forexItems.length > 0 && (
                        <div>
                            <Group gap={8} mb="sm">
                                <Text size="md" fw={700}>💱 Döviz Kurları</Text>
                                <Badge size="xs" color="teal" variant="light">{forexItems.length} kur</Badge>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                                {forexItems.map(item => <MarketCard key={item.symbol} item={item} />)}
                            </SimpleGrid>
                        </div>
                    )}

                    {/* Crypto */}
                    {(showAll || filter === 'crypto') && cryptoItems.length > 0 && (
                        <div>
                            <Group gap={8} mb="sm">
                                <Text size="md" fw={700}>₿ Kripto Paralar</Text>
                                <Badge size="xs" color="grape" variant="light">{cryptoItems.length} coin</Badge>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                                {cryptoItems.map(item => <MarketCard key={item.symbol} item={item} />)}
                            </SimpleGrid>
                        </div>
                    )}
                </Stack>
            )}

            {!loading && filtered.length === 0 && filteredGold.length === 0 && (
                <Text ta="center" c="dimmed" mt="xl">
                    Aramanızla eşleşen sonuç bulunamadı.
                </Text>
            )}
        </Stack>
    );
}
