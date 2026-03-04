'use client';

import { useState } from 'react';
import {
    Stack, Text, SimpleGrid, Paper, Group, NumberInput, Select, Button, Slider,
} from '@mantine/core';
import { IconPlayerPlay, IconChartHistogram, IconFlame, IconCoin, IconArrowUp } from '@tabler/icons-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
} from 'recharts';
import { runMonteCarloSimulation, formatCurrency } from '@/lib/mock-data';

const scenarioPresets = [
    { label: '📈 Faiz İndirimi Rallisi', return: 25, vol: 18, icon: IconArrowUp },
    { label: '🪙 Altın Rallisi', return: 15, vol: 12, icon: IconCoin },
    { label: '🔥 Yüksek Enflasyon', return: 8, vol: 30, icon: IconFlame },
    { label: '📊 Dengeli Büyüme', return: 12, vol: 15, icon: IconChartHistogram },
];

export default function SimulatorPage() {
    const [balance, setBalance] = useState<number | string>(500000);
    const [years, setYears] = useState<string | null>('3');
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [volatility, setVolatility] = useState(20);
    const [result, setResult] = useState<ReturnType<typeof runMonteCarloSimulation> | null>(null);

    const handleRun = () => {
        const sim = runMonteCarloSimulation(
            Number(balance),
            Number(years),
            expectedReturn,
            volatility,
        );
        setResult(sim);
    };

    const applyScenario = (preset: typeof scenarioPresets[0]) => {
        setExpectedReturn(preset.return);
        setVolatility(preset.vol);
    };

    // Build histogram from final values
    const getHistogramData = () => {
        if (!result) return [];
        const vals = result.finalValues;
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const buckets = 20;
        const step = (max - min) / buckets;
        const bins: { range: string; count: number; value: number }[] = [];

        for (let i = 0; i < buckets; i++) {
            const lo = min + i * step;
            const hi = lo + step;
            const count = vals.filter(v => v >= lo && v < hi).length;
            bins.push({
                range: `₺${(lo / 1000).toFixed(0)}K`,
                count,
                value: lo,
            });
        }
        return bins;
    };

    return (
        <Stack gap="lg">
            <Text size="xl" fw={800}>Monte Carlo Simülasyonu</Text>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {/* Form */}
                <Paper
                    p="xl"
                    radius="md"
                    style={{
                        background: 'var(--wp-bg-card)',
                        border: '1px solid var(--wp-border)',
                    }}
                >
                    <Stack gap="md">
                        <Text fw={700} size="sm" c="dimmed" tt="uppercase" lts={0.5}>
                            Simülasyon Parametreleri
                        </Text>

                        <NumberInput
                            label="Başlangıç Bakiyesi"
                            value={balance}
                            onChange={setBalance}
                            min={1000}
                            step={10000}
                            prefix="₺"
                            thousandSeparator="."
                            decimalSeparator=","
                        />

                        <Select
                            label="Süre"
                            data={[
                                { value: '1', label: '1 Yıl' },
                                { value: '3', label: '3 Yıl' },
                                { value: '5', label: '5 Yıl' },
                                { value: '10', label: '10 Yıl' },
                            ]}
                            value={years}
                            onChange={setYears}
                        />

                        <div>
                            <Text size="sm" fw={500} mb={4}>Beklenen Yıllık Getiri: %{expectedReturn}</Text>
                            <Slider
                                value={expectedReturn}
                                onChange={setExpectedReturn}
                                min={0}
                                max={50}
                                step={1}
                                marks={[
                                    { value: 0, label: '0%' },
                                    { value: 25, label: '25%' },
                                    { value: 50, label: '50%' },
                                ]}
                                color="blue"
                            />
                        </div>

                        <div>
                            <Text size="sm" fw={500} mb={4}>Volatilite: %{volatility}</Text>
                            <Slider
                                value={volatility}
                                onChange={setVolatility}
                                min={5}
                                max={50}
                                step={1}
                                marks={[
                                    { value: 5, label: '5%' },
                                    { value: 25, label: '25%' },
                                    { value: 50, label: '50%' },
                                ]}
                                color="grape"
                            />
                        </div>

                        <Button
                            leftSection={<IconPlayerPlay size={18} />}
                            onClick={handleRun}
                            fullWidth
                            size="md"
                            mt="sm"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                        >
                            Simülasyonu Çalıştır
                        </Button>
                    </Stack>
                </Paper>

                {/* Scenario Presets */}
                <Paper
                    p="xl"
                    radius="md"
                    style={{
                        background: 'var(--wp-bg-card)',
                        border: '1px solid var(--wp-border)',
                    }}
                >
                    <Text fw={700} size="sm" c="dimmed" tt="uppercase" lts={0.5} mb="md">
                        Senaryo Testleri
                    </Text>
                    <Stack gap="sm">
                        {scenarioPresets.map((preset, i) => (
                            <button
                                key={i}
                                className="scenario-btn"
                                onClick={() => applyScenario(preset)}
                            >
                                <Group gap={10}>
                                    <preset.icon size={18} />
                                    <div>
                                        <Text fw={600} size="sm">{preset.label}</Text>
                                        <Text size="xs" c="dimmed">
                                            Getiri: %{preset.return} · Volatilite: %{preset.vol}
                                        </Text>
                                    </div>
                                </Group>
                            </button>
                        ))}
                    </Stack>

                    {result && (
                        <Paper
                            mt="lg"
                            p="md"
                            radius="md"
                            style={{
                                background: 'rgba(59, 130, 246, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                            }}
                        >
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8}>Sonuç Özeti</Text>
                            <SimpleGrid cols={3} spacing="xs">
                                <div>
                                    <Text size="xs" c="dimmed">Kötü Senaryo (P10)</Text>
                                    <Text fw={800} c="red" size="sm">
                                        {formatCurrency(result.percentiles[result.percentiles.length - 1].p10)}
                                    </Text>
                                </div>
                                <div>
                                    <Text size="xs" c="dimmed">Ortalama (P50)</Text>
                                    <Text fw={800} c="blue" size="sm">
                                        {formatCurrency(result.percentiles[result.percentiles.length - 1].p50)}
                                    </Text>
                                </div>
                                <div>
                                    <Text size="xs" c="dimmed">İyi Senaryo (P90)</Text>
                                    <Text fw={800} c="green" size="sm">
                                        {formatCurrency(result.percentiles[result.percentiles.length - 1].p90)}
                                    </Text>
                                </div>
                            </SimpleGrid>
                        </Paper>
                    )}
                </Paper>
            </SimpleGrid>

            {/* Results Charts */}
            {result && (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    {/* Percentile Line Chart */}
                    <div className="chart-card">
                        <h3>📈 Beklenen Değer Aralığı (P10 / P50 / P90)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={result.percentiles}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={11}
                                    label={{ value: 'Ay', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
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
                                    formatter={(v?: number | string, name?: string) => [
                                        formatCurrency(Number(v ?? 0)),
                                        name === 'p10' ? 'Kötü (P10)' : name === 'p50' ? 'Ortalama (P50)' : 'İyi (P90)',
                                    ]}
                                />
                                <Line type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                                <Line type="monotone" dataKey="p90" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Histogram */}
                    <div className="chart-card">
                        <h3>📊 Final Değer Dağılımı (Histogram)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getHistogramData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="range" stroke="#64748b" fontSize={10} angle={-30} textAnchor="end" height={50} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a2035',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8,
                                        fontSize: 12,
                                    }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SimpleGrid>
            )}
        </Stack>
    );
}
