'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Stack, Text, Group, Paper, Table, Badge, Button, Modal,
    TextInput, NumberInput, Select, ActionIcon, Tooltip, Tabs,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
    IconPlus, IconArrowUpRight, IconArrowDownRight, IconWallet, IconTrash,
} from '@tabler/icons-react';
import {
    portfolioAssets, Asset,
    formatCurrency, formatPercent, formatNumber,
} from '@/lib/mock-data';

// Gold types from Kuyumcular Odası API
interface GoldPrice {
    name: string;
    buying: number;
    selling: number;
}

const GOLD_TYPES = [
    { value: 'gram-altin', label: '🪙 Gram Altın' },
    { value: 'ceyrek-altin', label: '🪙 Çeyrek Altın' },
    { value: 'yarim-altin', label: '🪙 Yarım Altın' },
    { value: 'tam-altin', label: '🪙 Tam Altın' },
    { value: 'cumhuriyet-altini', label: '🪙 Cumhuriyet Altını' },
    { value: '22-ayar-bilezik', label: '🪙 22 Ayar Bilezik (Gram)' },
    { value: '24-ayar-has-altin', label: '🪙 24 Ayar Has Altın (Gram)' },
    { value: 'ata-altin', label: '🪙 Ata Altın' },
    { value: 'resat-altin', label: '🪙 Reşat Altın' },
];

export default function PortfolioPage() {
    const [assets, setAssets] = useState<Asset[]>(portfolioAssets);
    const [opened, { open, close }] = useDisclosure(false);
    const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);

    // Form state
    const [addMode, setAddMode] = useState<string | null>('manual');
    const [newSymbol, setNewSymbol] = useState('');
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<string | null>('stock');
    const [newQuantity, setNewQuantity] = useState<number | string>(0);
    const [newAvgCost, setNewAvgCost] = useState<number | string>(0);
    const [newCurrentPrice, setNewCurrentPrice] = useState<number | string>(0);
    const [selectedGoldType, setSelectedGoldType] = useState<string | null>(null);
    const [newPieceCount, setNewPieceCount] = useState<number | string>(1);
    const [newWeightPerPiece, setNewWeightPerPiece] = useState<number | string>(0);

    const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

    // Fetch gold prices for auto-price feature
    const fetchGoldPrices = useCallback(async () => {
        try {
            const res = await fetch('/api/gold');
            if (res.ok) {
                const json = await res.json();
                setGoldPrices(json.data || []);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchGoldPrices();
    }, [fetchGoldPrices]);

    // When gold type changes, auto-fill price
    useEffect(() => {
        if (selectedGoldType && goldPrices.length > 0) {
            const goldType = GOLD_TYPES.find(g => g.value === selectedGoldType);
            const goldData = goldPrices.find(g => g.name === goldType?.label.replace('🪙 ', ''));

            if (goldData) {
                setNewCurrentPrice(goldData.selling);
                setNewName(goldType?.label.replace('🪙 ', '') || '');
                setNewSymbol(selectedGoldType.toUpperCase().replace(/-/g, '_'));
            }
        }
    }, [selectedGoldType, goldPrices]);

    const handleDeleteAsset = (asset: Asset) => {
        modals.openConfirmModal({
            title: 'Varlığı Sil',
            centered: true,
            children: (
                <Text size="sm">
                    <strong>{asset.symbol}</strong> ({asset.name}) varlığını portföyünüzden silmek istediğinize emin misiniz?
                </Text>
            ),
            labels: { confirm: 'Evet, Sil', cancel: 'İptal' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                setAssets(prev => prev.filter(a => a.id !== asset.id));
                notifications.show({
                    title: 'Varlık Silindi',
                    message: `${asset.symbol} portföyünüzden kaldırıldı`,
                    color: 'red',
                });
            },
        });
    };

    const handleAddAsset = () => {
        let finalQuantity = Number(newQuantity);

        if (selectedGoldType === '22-ayar-bilezik') {
            finalQuantity = Number(newPieceCount) * Number(newWeightPerPiece);
        }

        if (!newSymbol || !newName || !finalQuantity || !newAvgCost) {
            notifications.show({ title: 'Eksik Bilgi', message: 'Lütfen tüm alanları doldurun', color: 'red' });
            return;
        }

        const asset: Asset = {
            id: `a-${Date.now()}`,
            symbol: newSymbol.toUpperCase(),
            name: newName,
            type: (newType as Asset['type']) || 'stock',
            quantity: finalQuantity,
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

        // Reset
        setNewSymbol('');
        setNewName('');
        setNewQuantity(0);
        setNewPieceCount(1);
        setNewWeightPerPiece(0);
        setNewAvgCost(0);
        setNewCurrentPrice(0);
        setSelectedGoldType(null);
        setAddMode('manual');
        close();
    };

    const resetAndOpen = () => {
        setAddMode('manual');
        setNewType('stock');
        setSelectedGoldType(null);
        setNewSymbol('');
        setNewName('');
        setNewQuantity(0);
        setNewPieceCount(1);
        setNewWeightPerPiece(0);
        setNewAvgCost(0);
        setNewCurrentPrice(0);
        open();
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Text size="xl" fw={800}>Portföy</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={resetAndOpen} size="sm">
                    Varlık Ekle
                </Button>
            </Group>

            {/* Total Value Hero */}
            <Paper p="xl" radius="md" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2035 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Group gap={12}>
                    <IconWallet size={28} color="#3b82f6" />
                    <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>Toplam Portföy Değeri</Text>
                        <Text fw={800} style={{ fontSize: 36, lineHeight: 1.2 }}>{formatCurrency(totalValue)}</Text>
                    </div>
                </Group>
            </Paper>

            {/* Assets Table */}
            <Paper p="md" radius="md" style={{ background: 'var(--wp-bg-card)', border: '1px solid var(--wp-border)' }}>
                {assets.length === 0 ? (
                    <Text ta="center" c="dimmed" py="xl">
                        Portföyünüzde henüz varlık bulunmuyor. &ldquo;Varlık Ekle&rdquo; butonuna tıklayarak başlayın.
                    </Text>
                ) : (
                    <Table.ScrollContainer minWidth={900}>
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
                                    <Table.Th style={{ textAlign: 'center', width: 60 }}>İşlem</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {assets.map(asset => {
                                    const pnl = (asset.currentPrice - asset.avgCost) * asset.quantity;
                                    const pnlPct = ((asset.currentPrice - asset.avgCost) / asset.avgCost) * 100;
                                    const weight = ((asset.quantity * asset.currentPrice) / totalValue) * 100;
                                    const isProfit = pnl >= 0;

                                    return (
                                        <Table.Tr key={asset.id}>
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
                                                    <Text fw={600} c={isProfit ? 'green' : 'red'}>{formatCurrency(Math.abs(pnl))}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <Text fw={600} c={isProfit ? 'green' : 'red'}>{formatPercent(pnlPct)}</Text>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }} fw={600}>{weight.toFixed(1)}%</Table.Td>
                                            <Table.Td style={{ textAlign: 'center' }}>
                                                <Tooltip label="Varlığı sil">
                                                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteAsset(asset)}>
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </Paper>

            {/* Add Asset Modal */}
            <Modal opened={opened} onClose={close} title="Yeni Varlık Ekle" size="lg" centered
                styles={{ header: { background: 'var(--wp-bg-card)', borderBottom: '1px solid var(--wp-border)' }, body: { background: 'var(--wp-bg-card)' } }}
            >
                <Tabs value={addMode} onChange={setAddMode}>
                    <Tabs.List grow mb="md">
                        <Tabs.Tab value="manual">📝 Manuel Giriş</Tabs.Tab>
                        <Tabs.Tab value="gold">🪙 Altın Ekle</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="manual">
                        <Stack gap="md">
                            <TextInput label="Sembol" placeholder="ör: THYAO" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} required />
                            <TextInput label="Varlık Adı" placeholder="ör: Türk Hava Yolları" value={newName} onChange={e => setNewName(e.target.value)} required />
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
                            <NumberInput label="Miktar" placeholder="100" value={newQuantity} onChange={setNewQuantity} min={0} decimalScale={4} required />
                            <NumberInput label="Ortalama Alış Fiyatı" placeholder="150.00" value={newAvgCost} onChange={setNewAvgCost} min={0} decimalScale={2} prefix="₺" required />
                            <NumberInput label="Güncel Fiyat (opsiyonel)" placeholder="165.00" value={newCurrentPrice} onChange={setNewCurrentPrice} min={0} decimalScale={2} prefix="₺" />
                            <Button onClick={handleAddAsset} fullWidth mt="sm">Portföye Ekle</Button>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="gold">
                        <Stack gap="md">
                            <Select
                                label="Altın Türü"
                                placeholder="Altın türü seçin..."
                                data={GOLD_TYPES}
                                value={selectedGoldType}
                                onChange={(val) => {
                                    setSelectedGoldType(val);
                                    setNewType('gold');
                                }}
                                searchable
                                required
                            />

                            {selectedGoldType && Number(newCurrentPrice) > 0 && (
                                <Paper p="md" radius="md" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                                    <Group justify="space-between">
                                        <Text size="sm" fw={600}>{newName}</Text>
                                        <div>
                                            <Text size="xs" c="dimmed" ta="right">Güncel Satış Fiyatı</Text>
                                            <Text fw={800} size="lg" c="yellow" ta="right">{formatCurrency(Number(newCurrentPrice))}</Text>
                                        </div>
                                    </Group>
                                    <Text size="xs" c="dimmed" mt={4}>💡 Fiyat Kuyumcular Odası verilerinden otomatik alınmıştır</Text>
                                </Paper>
                            )}

                            {selectedGoldType === '22-ayar-bilezik' ? (
                                <Group grow>
                                    <NumberInput
                                        label="Bilezik Adedi"
                                        placeholder="ör: 3"
                                        value={newPieceCount}
                                        onChange={setNewPieceCount}
                                        min={1}
                                        decimalScale={0}
                                        required
                                    />
                                    <NumberInput
                                        label="Bilezik Gramı (tekil)"
                                        placeholder="ör: 20"
                                        value={newWeightPerPiece}
                                        onChange={setNewWeightPerPiece}
                                        min={0}
                                        decimalScale={2}
                                        required
                                    />
                                </Group>
                            ) : (
                                <NumberInput
                                    label="Miktar (adet veya gram)"
                                    placeholder="ör: 5 (adet) veya 50 (gram)"
                                    value={newQuantity}
                                    onChange={setNewQuantity}
                                    min={0}
                                    decimalScale={2}
                                    required
                                />
                            )}

                            <NumberInput
                                label="Alış Fiyatınız"
                                placeholder="Aldığınız fiyat"
                                value={newAvgCost}
                                onChange={setNewAvgCost}
                                min={0}
                                decimalScale={2}
                                prefix="₺"
                                required
                            />

                            {Number(newAvgCost) > 0 && Number(newCurrentPrice) > 0 && (
                                <Paper p="md" radius="md" style={{ background: 'var(--wp-bg-secondary)' }}>
                                    {(() => {
                                        const qty = selectedGoldType === '22-ayar-bilezik'
                                            ? Number(newPieceCount) * Number(newWeightPerPiece)
                                            : Number(newQuantity || 0);

                                        const pnl = (Number(newCurrentPrice) - Number(newAvgCost)) * qty;
                                        const pnlPct = Number(newAvgCost) > 0 ? ((Number(newCurrentPrice) - Number(newAvgCost)) / Number(newAvgCost)) * 100 : 0;
                                        const isProfit = pnl >= 0;
                                        return (
                                            <Group justify="space-between">
                                                <div>
                                                    <Text size="xs" c="dimmed">Tahmini K/Z</Text>
                                                    <Group gap={4}>
                                                        {isProfit ? <IconArrowUpRight size={16} color="#22c55e" /> : <IconArrowDownRight size={16} color="#ef4444" />}
                                                        <Text fw={700} c={isProfit ? 'green' : 'red'}>{formatCurrency(Math.abs(pnl))}</Text>
                                                    </Group>
                                                </div>
                                                <div>
                                                    <Text size="xs" c="dimmed" ta="right">K/Z %</Text>
                                                    <Text fw={700} c={isProfit ? 'green' : 'red'} ta="right">{formatPercent(pnlPct)}</Text>
                                                </div>
                                            </Group>
                                        );
                                    })()}
                                </Paper>
                            )}

                            <Button
                                onClick={handleAddAsset}
                                fullWidth
                                mt="sm"
                                color="yellow"
                                disabled={
                                    !selectedGoldType ||
                                    (selectedGoldType === '22-ayar-bilezik'
                                        ? (!newPieceCount || !newWeightPerPiece)
                                        : !newQuantity) ||
                                    !newAvgCost
                                }
                            >
                                🪙 Altını Portföye Ekle
                            </Button>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Modal>
        </Stack>
    );
}
