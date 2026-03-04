'use client';

import { Stack, Text, Paper, Switch, Group, Select, Divider, TextInput, Button } from '@mantine/core';
import { IconUser, IconPalette, IconBell, IconKey } from '@tabler/icons-react';

export default function SettingsPage() {
    return (
        <Stack gap="lg">
            <Text size="xl" fw={800}>Ayarlar</Text>

            <Paper
                p="xl"
                radius="md"
                style={{
                    background: 'var(--wp-bg-card)',
                    border: '1px solid var(--wp-border)',
                }}
            >
                <Group gap={10} mb="md">
                    <IconUser size={20} color="#3b82f6" />
                    <Text fw={700}>Profil</Text>
                </Group>
                <Stack gap="sm">
                    <TextInput label="Ad Soyad" defaultValue="Oğuz K." />
                    <TextInput label="E-posta" defaultValue="oguz@example.com" />
                    <Button variant="light" size="sm" mt="xs" style={{ alignSelf: 'flex-start' }}>
                        Kaydet
                    </Button>
                </Stack>
            </Paper>

            <Paper
                p="xl"
                radius="md"
                style={{
                    background: 'var(--wp-bg-card)',
                    border: '1px solid var(--wp-border)',
                }}
            >
                <Group gap={10} mb="md">
                    <IconPalette size={20} color="#8b5cf6" />
                    <Text fw={700}>Görünüm</Text>
                </Group>
                <Stack gap="sm">
                    <Select
                        label="Dil"
                        data={['Türkçe', 'English']}
                        defaultValue="Türkçe"
                    />
                    <Select
                        label="Para Birimi"
                        data={['TRY (₺)', 'USD ($)', 'EUR (€)']}
                        defaultValue="TRY (₺)"
                    />
                </Stack>
            </Paper>

            <Paper
                p="xl"
                radius="md"
                style={{
                    background: 'var(--wp-bg-card)',
                    border: '1px solid var(--wp-border)',
                }}
            >
                <Group gap={10} mb="md">
                    <IconBell size={20} color="#22c55e" />
                    <Text fw={700}>Bildirimler</Text>
                </Group>
                <Stack gap="sm">
                    <Switch label="Fiyat uyarıları" defaultChecked />
                    <Switch label="Portföy değişim bildirimleri" defaultChecked />
                    <Switch label="AI önerileri" defaultChecked />
                    <Switch label="Günlük özet e-posta" />
                </Stack>
            </Paper>

            <Paper
                p="xl"
                radius="md"
                style={{
                    background: 'var(--wp-bg-card)',
                    border: '1px solid var(--wp-border)',
                }}
            >
                <Group gap={10} mb="md">
                    <IconKey size={20} color="#f59e0b" />
                    <Text fw={700}>API Entegrasyonları</Text>
                </Group>
                <Text c="dimmed" size="sm">
                    🚧 API key yönetimi yakında aktif olacak. Şu an demo verilerle çalışıyorsunuz.
                </Text>
            </Paper>
        </Stack>
    );
}
