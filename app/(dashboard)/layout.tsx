import AppLayout from '@/components/layout/AppLayout';
import AiChatWidget from '@/components/ui/AiChatWidget';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppLayout>
            {children}
            <AiChatWidget />
        </AppLayout>
    );
}
