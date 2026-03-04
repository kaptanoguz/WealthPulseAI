'use client';

import { SimpleGrid, Text, Group, Stack, Paper, Table, Badge, Skeleton } from '@mantine/core';
import {
    IconTrendingUp,
    IconTrendingDown,
    IconWallet,
    IconArrowUpRight,
    IconArrowDownRight,
    IconChartPie,
    IconTrophy,
    IconAlertTriangle,
} from '@tabler/icons-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    getTotalPortfolioValue, getDailyPnL, getTopPerformers,
    getPortfolioDistribution, generatePortfolioHistory,
    recentTransactions, formatCurrency, formatPercent, formatNumber,
} from '@/lib/mock-data';
import { useState, useEffect } from 'react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 600);
        return () => clearTimeout(t);
    }, []);

    const totalValue = getTotalPortfolioValue();
    const dailyPnL = getDailyPnL();
    const { best, worst } = getTopPerformers();
    const distribution = getPortfolioDistribution();
    const history = generatePortfolioHistory(30);

    const kpis = [
        {
            label: 'Toplam Varlık',
            value: formatCurrency(totalValue),
            icon: IconWallet,
            color: '#3b82f6',
        },
        {
            label: 'Günlük Kar / Zarar',
            value: formatCurrency(dailyPnL.value),
            change: dailyPnL.percentage,
            icon: dailyPnL.value >= 0 ? IconTrendingUp : IconTrendingDown,
            color: dailyPnL.value >= 0 ? '#22c55e' : '#ef4444',
        },
        {
            label: 'En Çok Kazandıran',
            value: best.symbol,
            change: best.change24h,
            icon: IconTrophy,
            color: '#f59e0b',
        },
        {
            label: 'En Çok Kaybettiren',
            value: worst.symbol,
            change: worst.change24h,
            icon: IconAlertTriangle,
            color: '#ef4444',
        },
        {
            label: 'Hisse Ağırlığı',
            value: `${distribution.find(d => d.name === 'Hisse Senedi')?.percentage || 0}%`,
            icon: IconChartPie,
            color: '#8b5cf6',
        },
        {
            label: 'Altın Ağırlığı',
            value: `${(distribution.find(d => d.name === 'Altın')?.percentage || 0).toFixed(1)}%`,
            icon: IconChartPie,
            color: '#f59e0b',
        },
    ];

    if (!loaded) {
        return (
            <Stack gap="lg">
                <Text size="xl" fw={800}>Dashboard</Text>
                <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} h={120} radius="md" />
                    ))}
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Skeleton h={350} radius="md" />
                    <Skeleton h={350} radius="md" />
                </SimpleGrid>
                <Skeleton h={300} radius="md" />
            </Stack>
        );
    }

    return (
        <Stack gap="lg">
            <Text size="xl" fw={800}>Dashboard</Text>

            {/* KPI Cards */}
            <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
                {kpis.map((kpi, i) => (
                    <div className="kpi-card" key={i}>
                        <Group gap={6} mb={6}>
                            <kpi.icon size={16} color={kpi.color} />
                            <div className="kpi-label">{kpi.label}</div>
                        </Group>
                        <div className="kpi-value" style={{ fontSize: kpi.label.includes('Ağırlığı') ? 24 : undefined }}>
                            {kpi.value}
                        </div>
                        {kpi.change !== undefined && (
                            <div className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                                {kpi.change >= 0 ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
                                {formatPercent(kpi.change)}
                            </div>
                        )}
                    </div>
                ))}
            </SimpleGrid>

            {/* Charts Row */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {/* Portfolio Value Chart */}
                <div className="chart-card">
                    <h3>📈 Portföy Değeri — Son 30 Gün</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={11}
                                tickFormatter={v => v.slice(5)}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={11}
                                tickFormatter={v => `₺${(v / 1000).toFixed(0)}K`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#1a2035',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                                formatter={(v?: number | string) => [formatCurrency(Number(v ?? 0)), 'Değer']}
                                labelFormatter={l => `Tarih: ${l}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: '#3b82f6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Distribution Donut */}
                <div className="chart-card">
                    <h3>🍩 Portföy Dağılımı</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
                                labelLine={{ stroke: '#64748b' }}
                                style={{ fontSize: 11 }}
                            >
                                {distribution.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: '#1a2035',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                                formatter={(v?: number | string) => [formatCurrency(Number(v ?? 0)), 'Tutar']}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </SimpleGrid>

            {/* Recent Transactions */}
            <Paper
                p="lg"
                radius="md"
                style={{
                    background: 'var(--wp-bg-card)',
                    border: '1px solid var(--wp-border)',
                }}
            >
                <Text fw={600} mb="md" c="dimmed" size="sm">
                    📋 Son İşlemler
                </Text>
                <Table.ScrollContainer minWidth={600}>
                    <Table
                        striped
                        highlightOnHover
                        styles={{
                            table: { borderCollapse: 'separate', borderSpacing: '0 2px' },
                            tr: { background: 'transparent' },
                            th: { color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
                            td: { fontSize: 13, padding: '10px 12px', borderBottom: '1px solid var(--wp-border)' },
                        }}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Tarih</Table.Th>
                                <Table.Th>İşlem</Table.Th>
                                <Table.Th>Varlık</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Miktar</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Fiyat</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Toplam</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {recentTransactions.slice(0, 8).map(tx => (
                                <Table.Tr key={tx.id}>
                                    <Table.Td c="dimmed">{tx.date}</Table.Td>
                                    <Table.Td>
                                        <Badge
                                            size="sm"
                                            color={tx.type === 'buy' ? 'teal' : 'red'}
                                            variant="light"
                                        >
                                            {tx.type === 'buy' ? 'ALIŞ' : 'SATIŞ'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td fw={600}>{tx.symbol} <Text span c="dimmed" size="xs">{tx.name}</Text></Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>{formatNumber(tx.quantity)}</Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(tx.price)}</Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }} fw={600}>{formatCurrency(tx.total)}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Paper>
        </Stack>
    );
}
