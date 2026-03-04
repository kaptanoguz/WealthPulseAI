'use client';

import { useState, useRef, useEffect } from 'react';
import { IconMessageCircle, IconX, IconSend, IconSparkles } from '@tabler/icons-react';
import { initialChatMessages, ChatMessage } from '@/lib/mock-data';

export default function AiChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                'Portföyünüzü incelediğimde, **hisse senetleri ağırlıklı** bir dağılım görüyorum. Döviz ve altın pozisyonlarınız çeşitlendirme açısından olumlu.\n\n📊 Öneriler:\n- Risk dengeleme için bond/tahvil eklemeyi düşünebilirsiniz\n- THYAO pozisyonunuz güçlü performans gösteriyor',
                'Son 30 günlük performansınıza baktığımda portföy değeriniz **%6.2 artış** göstermiş. Bu, benchmark BIST-100 endeksinin üzerinde bir performans.\n\n⚡ Dikkat edilmesi gereken:\n- USD/TRY pozisyonunuz hafif gerilemiş\n- Altın pozisyonunuz hedge olarak iyi çalışıyor',
                'Monte Carlo simülasyonuna göre mevcut dağılımınızla:\n- **%50 ihtimalle** portföyünüz 3 yılda ₺850.000+ olabilir\n- **%90 güven aralığında** min ₺620.000 bekleniyor\n\n💡 Volatiliteyi azaltmak için sabit getirili enstrümanlar ekleyebilirsiniz.',
            ];

            const aiMsg: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: 'assistant',
                content: responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMsg]);
            setLoading(false);
        }, 1500);
    };

    const renderMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="chat-widget">
            {open && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <IconSparkles size={20} color="#3b82f6" />
                        <span>WealthPulse AI Danışman</span>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                color: 'var(--wp-text-secondary)',
                                cursor: 'pointer',
                            }}
                        >
                            <IconX size={18} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`chat-msg ${msg.role}`}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                            />
                        ))}
                        {loading && (
                            <div className="chat-msg assistant" style={{ opacity: 0.6 }}>
                                <span style={{ display: 'inline-flex', gap: 4 }}>
                                    <span className="dot-pulse">●</span>
                                    <span className="dot-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                                    <span className="dot-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Portföyüm hakkında sor..."
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={loading}>
                            <IconSend size={16} />
                        </button>
                    </div>
                </div>
            )}

            <button className="chat-bubble" onClick={() => setOpen(!open)}>
                {open ? <IconX size={24} /> : <IconMessageCircle size={24} />}
            </button>
        </div>
    );
}
