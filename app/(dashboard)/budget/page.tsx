'use client';

import { useState, useMemo } from 'react';
import {
    Stack, Text, Group, Paper, Table, Badge, Button, Modal, TextInput,
    NumberInput, Select, SegmentedControl, ActionIcon, Tooltip, SimpleGrid,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
    IconPlus, IconTrash, IconArrowUpRight, IconArrowDownRight,
    IconReceipt, IconCash, IconShoppingCart, IconHome, IconSchool,
    IconCar, IconDeviceMobile, IconBolt, IconToolsKitchen2,
    IconMedicalCross, IconShirt, IconGift,
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { formatCurrency } from '@/lib/mock-data';

// --- Types ---
interface Transaction {
    id: string;
    date: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
}

// --- Categories ---
const expenseCategories = [
    { value: 'market', label: '🛒 Market / Gıda' },
    { value: 'fatura', label: '💡 Fatura (Elektrik, Su, Doğalgaz, İnternet)' },
    { value: 'kira_gider', label: '🏠 Kira Gideri' },
    { value: 'egitim', label: '📚 Eğitim' },
    { value: 'kiyafet', label: '👕 Kıyafet' },
    { value: 'ulasim', label: '🚗 Ulaşım / Yakıt' },
    { value: 'saglik', label: '🏥 Sağlık' },
    { value: 'eglence', label: '🎬 Eğlence / Hobi' },
    { value: 'teknoloji', label: '📱 Teknoloji' },
    { value: 'ev_esya', label: '🏡 Ev Eşyası' },
    { value: 'hediye', label: '🎁 Hediye' },
    { value: 'yemek', label: '🍽️ Dışarıda Yemek' },
    { value: 'sigorta', label: '🛡️ Sigorta' },
    { value: 'kredi', label: '💳 Kredi / Taksit Ödemesi' },
    { value: 'diger_gider', label: '📋 Diğer Gider' },
];

const incomeCategories = [
    { value: 'maas', label: '💰 Maaş' },
    { value: 'kira_gelir', label: '🏠 Kira Geliri' },
    { value: 'fon_gelir', label: '📊 Fon / Yatırım Geliri' },
    { value: 'altin_gelir', label: '🪙 Altın Satış Geliri' },
    { value: 'kripto_gelir', label: '₿ Kripto Geliri' },
    { value: 'freelance', label: '💻 Freelance / Serbest İş' },
    { value: 'prim', label: '🏆 Prim / Bonus' },
    { value: 'faiz', label: '🏦 Faiz Geliri' },
    { value: 'temettü', label: '📈 Temettü Geliri' },
    { value: 'diger_gelir', label: '📋 Diğer Gelir' },
];

const categoryLabels: Record<string, string> = {};
[...expenseCategories, ...incomeCategories].forEach(c => {
    categoryLabels[c.value] = c.label;
});

const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4', '#84cc16', '#e11d48'];

// --- Mock Data ---
const initialTransactions: Transaction[] = [
    { id: 't1', date: '2026-03-04', type: 'expense', category: 'market', description: 'Haftalık market alışverişi', amount: 2450 },
    { id: 't2', date: '2026-03-03', type: 'expense', category: 'fatura', description: 'Elektrik faturası - Mart', amount: 890 },
    { id: 't3', date: '2026-03-03', type: 'expense', category: 'ulasim', description: 'Benzin', amount: 1200 },
    { id: 't4', date: '2026-03-02', type: 'income', category: 'maas', description: 'Mart maaşı', amount: 85000 },
    { id: 't5', date: '2026-03-01', type: 'expense', category: 'kiyafet', description: 'Kış montı', amount: 3500 },
    { id: 't6', date: '2026-02-28', type: 'income', category: 'kira_gelir', description: 'Şubat kira geliri', amount: 18000 },
    { id: 't7', date: '2026-02-27', type: 'expense', category: 'egitim', description: 'Online kurs (Udemy)', amount: 450 },
    { id: 't8', date: '2026-02-26', type: 'income', category: 'fon_gelir', description: 'Altın fon kâr realizasyonu', amount: 5200 },
    { id: 't9', date: '2026-02-25', type: 'expense', category: 'yemek', description: 'Restaurant', amount: 1800 },
    { id: 't10', date: '2026-02-24', type: 'expense', category: 'saglik', description: 'Eczane', amount: 650 },
    { id: 't11', date: '2026-02-23', type: 'income', category: 'temettü', description: 'THYAO temettü', amount: 4300 },
    { id: 't12', date: '2026-02-22', type: 'expense', category: 'teknoloji', description: 'Kulaklık', amount: 2100 },
    { id: 't13', date: '2026-02-20', type: 'expense', category: 'sigorta', description: 'Araç sigortası', amount: 8500 },
    { id: 't14', date: '2026-02-18', type: 'income', category: 'prim', description: 'Yıl sonu primi', amount: 25000 },
    { id: 't15', date: '2026-02-15', type: 'expense', category: 'kredi', description: 'Konut kredisi taksiti', amount: 14500 },
];

export default function BudgetPage() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [opened, { open, close }] = useDisclosure(false);
    const [viewFilter, setViewFilter] = useState('all');

    // Form state
    const [newType, setNewType] = useState<string>('expense');
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [newDescription, setNewDescription] = useState('');
    const [newAmount, setNewAmount] = useState<number | string>(0);
    const [newDate, setNewDate] = useState<Date | null>(new Date());

    // Computed values
    const totalIncome = useMemo(() =>
        transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
    const totalExpense = useMemo(() =>
        transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);
    const balance = totalIncome - totalExpense;

    // Category breakdown for pie charts
    const expenseByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });
        return Object.entries(map).map(([cat, val]) => ({
            name: categoryLabels[cat] || cat,
            value: val,
        })).sort((a, b) => b.value - a.value);
    }, [transactions]);

    const incomeByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.filter(t => t.type === 'income').forEach(t => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });
        return Object.entries(map).map(([cat, val]) => ({
            name: categoryLabels[cat] || cat,
            value: val,
        })).sort((a, b) => b.value - a.value);
    }, [transactions]);

    const filtered = transactions
        .filter(t => viewFilter === 'all' || t.type === viewFilter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAdd = () => {
        if (!newCategory || !newAmount || Number(newAmount) <= 0) {
            notifications.show({ title: 'Hata', message: 'Lütfen tüm alanları doldurun', color: 'red' });
            return;
        }
        const tx: Transaction = {
            id: `t-${Date.now()}`,
            date: newDate ? newDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            type: newType as 'income' | 'expense',
            category: newCategory,
            description: newDescription || (categoryLabels[newCategory] || ''),
            amount: Number(newAmount),
        };
        setTransactions(prev => [tx, ...prev]);
        notifications.show({
            title: newType === 'income' ? 'Gelir Eklendi' : 'Gider Eklendi',
            message: `${formatCurrency(tx.amount)} — ${categoryLabels[tx.category] || tx.category}`,
            color: newType === 'income' ? 'green' : 'blue',
        });
        setNewCategory(null);
        setNewDescription('');
        setNewAmount(0);
        close();
    };

    const handleDelete = (tx: Transaction) => {
        modals.openConfirmModal({
            title: 'İşlemi Sil',
            centered: true,
            children: <Text size="sm"><strong>{tx.description}</strong> ({formatCurrency(tx.amount)}) silinsin mi?</Text>,
            labels: { confirm: 'Sil', cancel: 'İptal' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                setTransactions(prev => prev.filter(t => t.id !== tx.id));
                notifications.show({ title: 'Silindi', message: 'İşlem silindi', color: 'red' });
            },
        });
    };

    const getCategoryIcon = (cat: string) => {
        const icons: Record<string, React.ReactNode> = {
            market: <IconShoppingCart size={16} />,
            fatura: <IconBolt size={16} />,
            kira_gider: <IconHome size={16} />,
            egitim: <IconSchool size={16} />,
            kiyafet: <IconShirt size={16} />,
            ulasim: <IconCar size={16} />,
            saglik: <IconMedicalCross size={16} />,
            teknoloji: <IconDeviceMobile size={16} />,
            hediye: <IconGift size={16} />,
            yemek: <IconToolsKitchen2 size={16} />,
            maas: <IconCash size={16} />,
            kira_gelir: <IconHome size={16} />,
            fon_gelir: <IconReceipt size={16} />,
        };
        return icons[cat] || <IconReceipt size={16} />;
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Text size="xl" fw={800}>Gelir / Gider Takibi</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={open} size="sm">
                    İşlem Ekle
                </Button>
            </Group>

            {/* Summary Cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Paper p="lg" radius="md" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #1a2035 100%)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <Group gap={8}>
                        <IconArrowUpRight size={24} color="#22c55e" />
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Toplam Gelir</Text>
                            <Text fw={800} size="xl" c="green">{formatCurrency(totalIncome)}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="lg" radius="md" style={{ background: 'linear-gradient(135deg, #4c0519 0%, #1a2035 100%)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <Group gap={8}>
                        <IconArrowDownRight size={24} color="#ef4444" />
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Toplam Gider</Text>
                            <Text fw={800} size="xl" c="red">{formatCurrency(totalExpense)}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="lg" radius="md" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2035 100%)', border: `1px solid ${balance >= 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                    <Group gap={8}>
                        <IconCash size={24} color={balance >= 0 ? '#3b82f6' : '#ef4444'} />
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Net Bakiye</Text>
                            <Text fw={800} size="xl" c={balance >= 0 ? 'blue' : 'red'}>{formatCurrency(balance)}</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Pie Charts */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Paper p="lg" radius="md" style={{ background: 'var(--wp-bg-card)', border: '1px solid var(--wp-border)' }}>
                    <Text fw={700} mb="md">📉 Gider Dağılımı</Text>
                    {expenseByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" paddingAngle={2}>
                                    {expenseByCategory.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RTooltip formatter={(value?: number | string) => formatCurrency(Number(value) || 0)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <Text c="dimmed" ta="center" py="xl">Gider verisi yok</Text>}
                    <Stack gap={4} mt="sm">
                        {expenseByCategory.slice(0, 5).map((cat, i) => (
                            <Group key={cat.name} justify="space-between">
                                <Group gap={8}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    <Text size="xs">{cat.name}</Text>
                                </Group>
                                <Text size="xs" fw={600}>{formatCurrency(cat.value)}</Text>
                            </Group>
                        ))}
                    </Stack>
                </Paper>

                <Paper p="lg" radius="md" style={{ background: 'var(--wp-bg-card)', border: '1px solid var(--wp-border)' }}>
                    <Text fw={700} mb="md">📈 Gelir Dağılımı</Text>
                    {incomeByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={incomeByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" paddingAngle={2}>
                                    {incomeByCategory.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RTooltip formatter={(value?: number | string) => formatCurrency(Number(value) || 0)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <Text c="dimmed" ta="center" py="xl">Gelir verisi yok</Text>}
                    <Stack gap={4} mt="sm">
                        {incomeByCategory.slice(0, 5).map((cat, i) => (
                            <Group key={cat.name} justify="space-between">
                                <Group gap={8}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    <Text size="xs">{cat.name}</Text>
                                </Group>
                                <Text size="xs" fw={600}>{formatCurrency(cat.value)}</Text>
                            </Group>
                        ))}
                    </Stack>
                </Paper>
            </SimpleGrid>

            {/* Transactions Table */}
            <Paper p="md" radius="md" style={{ background: 'var(--wp-bg-card)', border: '1px solid var(--wp-border)' }}>
                <Group justify="space-between" mb="md">
                    <Text fw={700}>İşlem Geçmişi</Text>
                    <SegmentedControl
                        value={viewFilter}
                        onChange={setViewFilter}
                        data={[
                            { label: 'Tümü', value: 'all' },
                            { label: 'Gelirler', value: 'income' },
                            { label: 'Giderler', value: 'expense' },
                        ]}
                        size="xs"
                        styles={{ root: { background: 'var(--wp-bg-secondary)' } }}
                    />
                </Group>

                <Table.ScrollContainer minWidth={700}>
                    <Table
                        highlightOnHover
                        styles={{
                            th: { color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
                            td: { fontSize: 13, padding: '10px 12px', borderBottom: '1px solid var(--wp-border)' },
                        }}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Tarih</Table.Th>
                                <Table.Th>Tür</Table.Th>
                                <Table.Th>Kategori</Table.Th>
                                <Table.Th>Açıklama</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Tutar</Table.Th>
                                <Table.Th style={{ textAlign: 'center', width: 50 }}>Sil</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filtered.map(tx => (
                                <Table.Tr key={tx.id}>
                                    <Table.Td>{new Date(tx.date).toLocaleDateString('tr-TR')}</Table.Td>
                                    <Table.Td>
                                        <Badge size="xs" color={tx.type === 'income' ? 'green' : 'red'} variant="light">
                                            {tx.type === 'income' ? 'GELİR' : 'GİDER'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap={6}>
                                            {getCategoryIcon(tx.category)}
                                            <Text size="sm">{categoryLabels[tx.category] || tx.category}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td><Text size="sm" c="dimmed">{tx.description}</Text></Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Text fw={600} c={tx.type === 'income' ? 'green' : 'red'}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>
                                        <Tooltip label="Sil">
                                            <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(tx)}>
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Paper>

            {/* Add Transaction Modal */}
            <Modal opened={opened} onClose={close} title="Yeni İşlem Ekle" size="md" centered
                styles={{ header: { background: 'var(--wp-bg-card)', borderBottom: '1px solid var(--wp-border)' }, body: { background: 'var(--wp-bg-card)' } }}
            >
                <Stack gap="md">
                    <SegmentedControl
                        value={newType}
                        onChange={(v) => { setNewType(v); setNewCategory(null); }}
                        data={[
                            { label: '💸 Gider', value: 'expense' },
                            { label: '💰 Gelir', value: 'income' },
                        ]}
                        fullWidth
                        size="md"
                    />
                    <Select
                        label="Kategori"
                        placeholder="Kategori seçin..."
                        data={newType === 'expense' ? expenseCategories : incomeCategories}
                        value={newCategory}
                        onChange={setNewCategory}
                        searchable
                        required
                    />
                    <TextInput
                        label="Açıklama"
                        placeholder="ör: Mart elektrik faturası"
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                    />
                    <NumberInput
                        label="Tutar"
                        placeholder="1500.00"
                        value={newAmount}
                        onChange={setNewAmount}
                        min={0}
                        decimalScale={2}
                        prefix="₺"
                        required
                    />
                    <DatePickerInput
                        label="Tarih"
                        placeholder="Tarih seçin"
                        value={newDate}
                        onChange={(val) => setNewDate(val ? new Date(val) : null)}
                        valueFormat="DD/MM/YYYY"
                    />
                    <Button onClick={handleAdd} fullWidth mt="sm" color={newType === 'income' ? 'green' : 'blue'}>
                        {newType === 'income' ? 'Gelir Ekle' : 'Gider Ekle'}
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
