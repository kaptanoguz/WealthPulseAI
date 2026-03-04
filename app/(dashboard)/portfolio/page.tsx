'use client';

import { useState } from 'react';
import {
    Stack, Text, Group, Paper, Table, Badge, Button, Modal,
    TextInput, NumberInput, Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus, IconArrowUpRight, IconArrowDownRight, IconWallet,
} from '@tabler/icons-react';
import {
    portfolioAssets, Asset, getTotalPortfolioValue,
    formatCurrency, formatPercent, formatNumber,
} from '@/lib/mock-data';

export default function PortfolioPage() {
    const [assets, setAssets] = useState<Asset[]>(portfolioAssets);
    const [opened, { open, close }] = useDisclosure(false);

    // New asset form state
    const [newSymbol, setNewSymbol] = useState('');
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<string | null>('stock');
    const [newQuantity, setNewQuantity] = useState<number | string>(0);
    const [newAvgCost, setNewAvgCost] = useState<number | string>(0);
    const [newCurrentPrice, setNewCurrentPrice] = useState<number | string>(0);

    const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

    const handleAddAsset = () => {
        if (!newSymbol || !newName || !newQuantity || !newAvgCost) {
            notifications.show({
                title: 'Eksik Bilgi',
                message: 'Lütfen tüm alanları doldurun',
                color: 'red',
            });
            return;
        }

        const asset: Asset = {
            id: `a-${Date.now()}`,
            symbol: newSymbol.toUpperCase(),
            name: newName,
            type: (newType as Asset['type']) || 'stock',
            quantity: Number(newQuantity),
            avgCost: Number(newAvgCost),
            currentPrice: Number(newCurrentPrice) || Number(newAvgCost),
            change24h: 0,
            currency: 'TRY',
        };

        setAssets(prev => [...prev, asset]);
        notifications.show({
            title: 'Varlık Eklendi',
            message: `${asset.symbol} portföyünüze eklendi`,
            color: 'green',
        });

        // Reset form
        setNewSymbol('');
        setNewName('');
        setNewQuantity(0);
        setNewAvgCost(0);
        setNewCurrentPrice(0);
        close();
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Text size="xl" fw={800}>Portföy</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={open} size="sm">
                    Varlık Ekle
                </Button>
            </Group>

            {/* Total Value Hero */}
            <Paper
                p="xl"
                radius="md"
                style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2035 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
            >
                <Group gap={12}>
                    <IconWallet size={28} color="#3b82f6" />
                    <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>Toplam Portföy Değeri</Text>
                        <Text
                            fw={800}
                            style={{ fontSize: 36, lineHeight: 1.2 }}
                        >
                            {formatCurrency(totalValue)}
                        </Text>
                    </div>
                </Group>
            </Paper>

            {/* Assets Table */}
            <Paper
                p="md"
                radius="md"
                style={{
                    background: 'var(--wp-bg-card)',
                    border: '1px solid var(--wp-border)',
                }}
            >
                <Table.ScrollContainer minWidth={800}>
                    <Table
                        highlightOnHover
                        styles={{
                            th: { color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
                            td: { fontSize: 13, padding: '12px', borderBottom: '1px solid var(--wp-border)' },
                        }}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Varlık</Table.Th>
                                <Table.Th>Tür</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Miktar</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Alış Fiyatı</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Güncel Fiyat</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Kar / Zarar</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>K/Z %</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Ağırlık %</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {assets.map(asset => {
                                const pnl = (asset.currentPrice - asset.avgCost) * asset.quantity;
                                const pnlPct = ((asset.currentPrice - asset.avgCost) / asset.avgCost) * 100;
                                const weight = ((asset.quantity * asset.currentPrice) / totalValue) * 100;
                                const isProfit = pnl >= 0;

                                return (
                                    <Table.Tr key={asset.id} style={{ cursor: 'pointer' }}>
                                        <Table.Td>
                                            <div>
                                                <Text fw={700} size="sm">{asset.symbol}</Text>
                                                <Text size="xs" c="dimmed">{asset.name}</Text>
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge size="xs" variant="light" color={
                                                asset.type === 'stock' ? 'blue' :
                                                    asset.type === 'gold' ? 'yellow' :
                                                        asset.type === 'forex' ? 'teal' :
                                                            asset.type === 'crypto' ? 'grape' :
                                                                asset.type === 'fund' ? 'cyan' : 'gray'
                                            }>
                                                {asset.type.toUpperCase()}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>{formatNumber(asset.quantity)}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(asset.avgCost)}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }} fw={600}>{formatCurrency(asset.currentPrice)}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Group gap={4} justify="flex-end">
                                                {isProfit ? <IconArrowUpRight size={14} color="#22c55e" /> : <IconArrowDownRight size={14} color="#ef4444" />}
                                                <Text fw={600} c={isProfit ? 'green' : 'red'}>
                                                    {formatCurrency(Math.abs(pnl))}
                                                </Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Text fw={600} c={isProfit ? 'green' : 'red'}>
                                                {formatPercent(pnlPct)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }} fw={600}>
                                            {weight.toFixed(1)}%
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Paper>

            {/* Add Asset Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title="Yeni Varlık Ekle"
                size="md"
                centered
                styles={{
                    header: { background: 'var(--wp-bg-card)', borderBottom: '1px solid var(--wp-border)' },
                    body: { background: 'var(--wp-bg-card)' },
                }}
            >
                <Stack gap="md">
                    <TextInput
                        label="Sembol"
                        placeholder="ör: THYAO"
                        value={newSymbol}
                        onChange={e => setNewSymbol(e.target.value)}
                        required
                    />
                    <TextInput
                        label="Varlık Adı"
                        placeholder="ör: Türk Hava Yolları"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                    />
                    <Select
                        label="Tür"
                        data={[
                            { value: 'stock', label: 'Hisse Senedi' },
                            { value: 'etf', label: 'ETF' },
                            { value: 'gold', label: 'Altın' },
                            { value: 'forex', label: 'Döviz' },
                            { value: 'crypto', label: 'Kripto' },
                            { value: 'fund', label: 'Fon' },
                        ]}
                        value={newType}
                        onChange={setNewType}
                    />
                    <NumberInput
                        label="Miktar"
                        placeholder="100"
                        value={newQuantity}
                        onChange={setNewQuantity}
                        min={0}
                        decimalScale={4}
                        required
                    />
                    <NumberInput
                        label="Ortalama Alış Fiyatı"
                        placeholder="150.00"
                        value={newAvgCost}
                        onChange={setNewAvgCost}
                        min={0}
                        decimalScale={2}
                        prefix="₺"
                        required
                    />
                    <NumberInput
                        label="Güncel Fiyat (opsiyonel)"
                        placeholder="165.00"
                        value={newCurrentPrice}
                        onChange={setNewCurrentPrice}
                        min={0}
                        decimalScale={2}
                        prefix="₺"
                    />
                    <Button onClick={handleAddAsset} fullWidth mt="sm">
                        Portföye Ekle
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
