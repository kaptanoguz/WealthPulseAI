'use client';

import { useState } from 'react';
import { SimpleGrid, Text, Stack, TextInput, SegmentedControl, Group, Badge } from '@mantine/core';
import { IconSearch, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import {
    LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { marketData, MarketItem, formatCurrency, formatPercent } from '@/lib/mock-data';

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

function MarketCard({ item }: { item: MarketItem }) {
    const isPositive = item.change >= 0;
    const changeColor = isPositive ? '#22c55e' : '#ef4444';

    return (
        <div className="market-card">
            <Group justify="space-between" mb={8}>
                <div>
                    <Text fw={700} size="md">{item.symbol}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>{item.name}</Text>
                </div>
                <Badge size="xs" variant="light" color={
                    item.type === 'stock' ? 'blue' :
                        item.type === 'gold' ? 'yellow' :
                            item.type === 'forex' ? 'teal' :
                                item.type === 'crypto' ? 'grape' : 'gray'
                }>
                    {item.type === 'stock' ? 'HİSSE' :
                        item.type === 'gold' ? 'ALTIN' :
                            item.type === 'forex' ? 'DÖVİZ' :
                                item.type === 'crypto' ? 'KRİPTO' : 'DİĞER'}
                </Badge>
            </Group>

            <SparklineChart data={item.sparkline} color={changeColor} />

            <Group justify="space-between" mt={8}>
                <Text fw={800} size="lg">
                    {item.type === 'crypto' ? `$${formatCurrency(item.price, 'USD').replace(/[^0-9.,]/g, '')}` : formatCurrency(item.price)}
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
    { label: 'Hisse', value: 'stock' },
    { label: 'Altın', value: 'gold' },
    { label: 'Döviz', value: 'forex' },
    { label: 'Kripto', value: 'crypto' },
];

export default function MarketsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = marketData.filter(item => {
        const matchesSearch = item.symbol.toLowerCase().includes(search.toLowerCase()) ||
            item.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || item.type === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <Stack gap="lg">
            <Text size="xl" fw={800}>Piyasalar</Text>

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

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                {filtered.map(item => (
                    <MarketCard key={item.symbol} item={item} />
                ))}
            </SimpleGrid>

            {filtered.length === 0 && (
                <Text ta="center" c="dimmed" mt="xl">
                    Aramanızla eşleşen sonuç bulunamadı.
                </Text>
            )}
        </Stack>
    );
}
