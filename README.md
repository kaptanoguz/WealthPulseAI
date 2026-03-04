# WealthPulse AI

> 🏦 Modern AI-destekli finansal varlık yönetim platformu

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Mantine](https://img.shields.io/badge/Mantine-8-339af0?logo=mantine)
![Recharts](https://img.shields.io/badge/Recharts-3-22c55e)

## ⚠️ Yasal Uyarı

**Bu uygulama yatırım tavsiyesi niteliğinde değildir.** Sadece bilgilendirme ve eğitim amaçlıdır. Yatırım kararlarınızı yetkili finansal danışmanlara danışarak veriniz.

## 🚀 Özellikler

- **📊 Dashboard** — KPI kartları, portföy değer grafiği, varlık dağılımı donut chart, son işlemler tablosu
- **💼 Portföy Yönetimi** — Detaylı varlık tablosu (hisse, altın, döviz, kripto, fon), kar/zarar takibi, varlık ekleme
- **📈 Piyasalar** — Canlı fiyat kartları, sparkline grafikler, arama ve kategori filtreleme
- **🧮 Monte Carlo Simülasyonu** — Senaryo analizi, percentile corridor chart, histogram dağılımı
- **🤖 AI Danışman** — Yüzen chat widget, markdown destekli yanıtlar
- **🎨 Modern UI** — Koyu tema, glassmorphism, responsive tasarım, Mantine v8

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript 5 |
| UI Kit | Mantine v8 |
| Grafikler | Recharts 3 |
| İkonlar | Tabler Icons |
| CSS | PostCSS + Mantine preset |

## 📦 Kurulum

```bash
# Klonla
git clone https://github.com/kaptanoguz/WealthPulseAI.git
cd WealthPulseAI

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Proje Yapısı

```
wealthpulseai/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout (AppShell + AI Chat)
│   │   ├── dashboard/page.tsx  # Ana dashboard
│   │   ├── markets/page.tsx    # Piyasalar
│   │   ├── portfolio/page.tsx  # Portföy yönetimi
│   │   ├── simulator/page.tsx  # Monte Carlo simülasyonu
│   │   ├── reports/page.tsx    # Raporlar
│   │   └── settings/page.tsx   # Ayarlar
│   ├── layout.tsx              # Root layout (MantineProvider)
│   ├── page.tsx                # / → /dashboard redirect
│   └── globals.css             # Global stiller
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx       # Header + Sidebar + Main
│   └── ui/
│       └── AiChatWidget.tsx    # AI chat floating widget
├── lib/
│   ├── api.ts                  # API client utility
│   └── mock-data.ts            # Demo verileri
├── theme/
│   └── theme.ts                # Mantine tema konfigürasyonu
└── postcss.config.mjs          # PostCSS + Mantine preset
```

## 🔧 Ortam Değişkenleri

`.env.local` dosyasını oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📄 Lisans

MIT License

---

*Built with ❤️ by WealthPulse AI Team*
