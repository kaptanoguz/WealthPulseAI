'use client';

import { Stack, Text, Paper, SimpleGrid, Group } from '@mantine/core';
import { IconReport, IconCalendar, IconChartBar, IconFileAnalytics } from '@tabler/icons-react';

const reportCards = [
    { title: 'Aylık Performans Raporu', desc: 'Portföy getirisini benchmark ile karşılaştırın', icon: IconChartBar, color: '#3b82f6' },
    { title: 'Vergi Raporu', desc: 'Yıllık alım-satım kar/zarar özeti', icon: IconFileAnalytics, color: '#22c55e' },
    { title: 'Risk Analizi', desc: 'Portföy volatilitesi ve max drawdown', icon: IconReport, color: '#f59e0b' },
    { title: 'İşlem Geçmişi', desc: 'Tüm alım-satım işlemleri detayı', icon: IconCalendar, color: '#8b5cf6' },
];

export default function ReportsPage() {
    return (
        <Stack gap="lg">
            <Text size="xl" fw={800}>Raporlar</Text>
            <Text c="dimmed" size="sm">Detaylı finansal raporlarınızı buradan oluşturabilirsiniz.</Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {reportCards.map((card, i) => (
                    <Paper
                        key={i}
                        p="xl"
                        radius="md"
                        style={{
                            background: 'var(--wp-bg-card)',
                            border: '1px solid var(--wp-border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        className="kpi-card"
                    >
                        <Group gap={14}>
                            <card.icon size={28} color={card.color} />
                            <div>
                                <Text fw={700} size="md">{card.title}</Text>
                                <Text c="dimmed" size="xs">{card.desc}</Text>
                            </div>
                        </Group>
                    </Paper>
                ))}
            </SimpleGrid>

            <Paper
                p="xl"
                radius="md"
                style={{
                    background: 'var(--wp-bg-card)',
                    border: '1px solid var(--wp-border)',
                    textAlign: 'center',
                }}
            >
                <Text c="dimmed" size="sm" mb="md">🚧 Rapor oluşturma özelliği yakında aktif olacak.</Text>
            </Paper>
        </Stack>
    );
}
