# Kalisto - Solana Token Explorer & DEX Platform

Modern bir Solana blockchain token keşif, yönetim ve ticaret platformu. Kullanıcıların Solana üzerindeki tokenları keşfedebileceği, yeni tokenlar oluşturabileceği, portföylerini yönetebileceği ve Jupiter protokolü üzerinden token swap işlemleri yapabileceği kapsamlı bir web uygulaması.

## 🚀 Özellikler

### Token Yönetimi
- **Token Keşfi**: Trending ve öne çıkan tokenları keşfetme
- **Token Oluşturma**: Yeni Solana tokenları oluşturma ve listeleme
- **Token Düzenleme**: Mevcut token bilgilerini güncelleme (admin)
- **Kategorizasyon**: Token etiketleme sistemi (Trend, Meme, AI, vs.)

### Wallet & Trading
- **Solana Wallet Entegrasyonu**: Privy ile güvenli wallet bağlantısı
- **Otomatik Wallet Oluşturma**: Kullanıcılar için otomatik Solana cüzdanı
- **Jupiter DEX Entegrasyonu**: Token swap ve ticaret işlemleri
- **Portföy Yönetimi**: Cüzdan bakiyesi ve token portföyü görüntüleme

### Real-time Data
- **Fiyat Takibi**: Anlık token fiyatları ve piyasa verileri
- **Market Analytics**: 24 saatlik değişim, hacim ve likidite bilgileri
- **Chart Görüntüleme**: Token fiyat grafikleri
- **DexScreener Entegrasyonu**: Gelişmiş piyasa analizi

### Admin Features
- **Token Onaylama**: Admin tarafından token doğrulama
- **İçerik Yönetimi**: Featured ve trending token yönetimi
- **Kullanıcı Yönetimi**: Yetkilendirme ve erişim kontrolü

## 🛠 Teknoloji Yığını

### Frontend
- **React 18**: Modern React hooks ve components
- **TypeScript**: Tip güvenliği ve geliştirici deneyimi
- **Vite**: Hızlı geliştirme ve build aracı
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI bileşen kütüphanesi
- **Zustand**: Lightweight state yönetimi
- **React Router**: Client-side routing

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Backend tip güvenliği

### Database & Services
- **Supabase**: PostgreSQL veritabanı ve backend servisleri
- **Row Level Security (RLS)**: Güvenli veri erişimi

### Blockchain & Web3
- **Solana Web3.js**: Solana blockchain etkileşimi
- **Privy**: Web3 authentication ve wallet yönetimi
- **Jupiter API**: Token swap ve DEX işlemleri
- **SPL Token**: Solana Program Library token standardı

### Deployment & DevOps
- **Railway**: Cloud hosting ve deployment
- **GitHub Actions**: CI/CD pipeline (optional)
- **Environment Variables**: Güvenli konfigürasyon yönetimi

## 📁 Proje Yapısı

```
kalistowebsitemaster/
├── src/
│   ├── components/          # React bileşenleri
│   │   ├── ui/             # Yeniden kullanılabilir UI bileşenleri
│   │   ├── TokenPage.tsx   # Token detay sayfası
│   │   ├── Portfolio.tsx   # Portföy yönetimi
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useJupiterSwap.ts    # Jupiter swap işlemleri
│   │   ├── useSolanaWallet.ts   # Solana wallet yönetimi
│   │   └── ...
│   ├── store/              # Zustand state stores
│   │   ├── tokensStore.ts  # Token state yönetimi
│   │   ├── useWalletStore.ts    # Wallet state
│   │   └── ...
│   ├── lib/                # Utility ve helper fonksiyonları
│   │   ├── supabase.ts     # Database bağlantısı
│   │   ├── constants.ts    # Uygulama sabitleri
│   │   └── ...
│   ├── utils/              # Utility fonksiyonları
│   │   ├── solana.ts       # Solana helpers
│   │   ├── formatters.ts   # Veri formatlama
│   │   └── ...
│   └── pages/              # Sayfa bileşenleri
├── server/                 # Backend API
│   ├── index.ts           # Express server
│   ├── jupiter.ts         # Jupiter swap API
│   └── api.ts             # API endpoints
└── public/                # Statik dosyalar
```

## 🗄️ Veritabanı Yapısı

### Tokens Tablosu
```sql
CREATE TABLE tokens (
  id TEXT PRIMARY KEY,              -- Unique token identifier
  symbol TEXT NOT NULL,            -- Token symbol (e.g., "MICHI")
  name TEXT NOT NULL,              -- Token name
  image TEXT,                      -- Token logo URL
  emoji TEXT,                      -- Token emoji
  ca TEXT,                         -- Contract address
  twitter TEXT,                    -- Twitter handle
  telegram TEXT,                   -- Telegram channel
  website TEXT,                    -- Official website
  description TEXT,                -- Token description
  tags TEXT[] DEFAULT '{}',        -- Category tags
  is_verified BOOLEAN DEFAULT false,    -- Admin verification
  is_new BOOLEAN DEFAULT true,     -- New token flag
  decimals INTEGER DEFAULT 9,       -- Token decimals
  social_links JSONB,              -- Social media links
  listed_at TIMESTAMP DEFAULT now(), -- Listing date
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Row Level Security (RLS)
- Public read access to all tokens
- Write operations restricted to authenticated users
- Admin operations require elevated permissions

## 🔧 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- npm veya yarn
- Supabase hesabı
- Privy hesabı (Web3 auth için)
- QuickNode RPC URL (Solana için)

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/kalista78/kalistowebsite.git
cd kalistowebsite
```

### 2. Dependencies yükleyin
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install && cd ..
```

### 3. Environment Variables ayarlayın

**.env** (Frontend için):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_QUICKNODE_RPC_URL=your_quicknode_rpc_url
```

**server/.env** (Backend için):
```env
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
QUICKNODE_RPC_URL=your_quicknode_rpc_url
NODE_ENV=development
PORT=3001
```

### 4. Supabase Database kurulumu
```sql
-- Token tablosu oluşturma
CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  emoji TEXT,
  age TEXT,
  ca TEXT,
  twitter TEXT,
  telegram TEXT,
  website TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT true,
  listed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  decimals INTEGER DEFAULT 9,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Updated trigger oluşturma
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tokens_updated_at
BEFORE UPDATE ON tokens
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- RLS aktifleştirme
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full public access to tokens"
ON tokens
USING (true)
WITH CHECK (true);
```

### 5. Uygulamayı başlatın
```bash
# Backend server (Terminal 1)
npm run api

# Frontend (Terminal 2)
npm run dev
```

Uygulama şu adreslerde çalışacak:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🌐 API Endpoints

### Token Management
- `GET /api/tokens` - Tüm tokenları listele
- `POST /api/tokens` - Yeni token oluştur
- `PUT /api/tokens/:id` - Token güncelle
- `DELETE /api/tokens/:id` - Token sil

### Jupiter Swap
- `POST /api/jupiter/quote` - Swap fiyat teklifi al
- `POST /api/jupiter/swap` - Swap işlemi gerçekleştir

### Wallet Operations
- `POST /api/wallet/create` - Yeni wallet oluştur
- `GET /api/wallet/balance` - Wallet bakiyesi
- `POST /api/wallet/delegate` - Transaction delegation

## 🚀 Deployment (Railway)

### 1. Railway hesabı oluşturun
[Railway.app](https://railway.app) üzerinden hesap oluşturun.

### 2. GitHub repository bağlayın
- Railway Dashboard → New Project
- Deploy from GitHub repo seçin
- Repository'nizi seçin

### 3. Environment Variables ekleyin
Railway dashboard'da aşağıdaki environment variable'ları ekleyin:
```env
NODE_ENV=production
PORT=3000
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
VITE_QUICKNODE_RPC_URL=your_quicknode_rpc_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy edin
Railway otomatik olarak main branch'e push sonrası deploy yapacak.

## 🔒 Güvenlik

### Authentication & Authorization
- **Privy Web3 Auth**: Güvenli wallet bağlantısı
- **JWT Tokens**: API authentication
- **Admin Panel**: Email-based admin yetkilendirmesi

### Database Security
- **Row Level Security (RLS)**: Veri erişim kontrolü
- **Environment Variables**: Sensitive data koruması
- **CORS**: Cross-origin request koruması

### Smart Contract Interactions
- **Transaction Signing**: Client-side imzalama
- **RPC Rate Limiting**: API abuse prevention
- **Fee Management**: %1 platform ücreti

## 📊 İş Akışı (Flow)

### 1. Kullanıcı Kaydı & Authentication
```
Kullanıcı → Privy Auth → Wallet Connection → Otomatik Solana Wallet
```

### 2. Token Listeleme İş Akışı
```
Admin → Token Oluştur → Supabase Database → Frontend Display → User Discovery
```

### 3. Token Trading İş Akışı
```
User → Token Seç → Jupiter Quote → Transaction Sign → Swap Execute → Balance Update
```

### 4. Data Flow
```
Frontend ↔ Zustand Store ↔ Supabase Database
         ↕
    Express API ↔ Jupiter API ↔ Solana Blockchain
```

## 🎯 Admin İşlevleri

### Token Yönetimi
- Yeni token ekleme ve düzenleme
- Token doğrulama ve onaylama
- Featured/Trending kategorilerini yönetme

### Admin Erişimi
Admin email adresleri (`src/lib/constants.ts`):
- `unalltaha@gmail.com`
- `doganbozkurrt34@gmail.com`

## 🔧 Geliştirme

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (recommended)

### Testing
```bash
# Unit tests çalıştırma
npm test

# E2E tests
npm run test:e2e
```

### Build Production
```bash
# Frontend build
npm run build

# Backend build
npm run build:server
```

## 📚 Önemli Dependencies

### Frontend Core
- `@privy-io/react-auth`: Web3 authentication
- `@supabase/supabase-js`: Database client
- `@solana/web3.js`: Solana blockchain
- `zustand`: State management
- `react-router-dom`: Routing

### UI & Styling
- `@radix-ui/*`: Headless UI components
- `tailwindcss`: CSS framework
- `lucide-react`: Icons
- `recharts`: Charts and graphs

### Backend Core
- `express`: Web framework
- `@privy-io/server-auth`: Server-side auth
- `cors`: CORS middleware

## 🐛 Troubleshooting

### Yaygın Sorunlar

1. **RPC Connection Errors**
   - QuickNode RPC URL'in doğru olduğunu kontrol edin
   - Rate limiting yapıldığında fallback RPC kullanın

2. **Supabase Connection Issues**
   - Environment variables'ları kontrol edin
   - RLS policies'in doğru kurulduğunu doğrulayın

3. **Privy Authentication**
   - App ID ve Secret'ın doğru olduğunu kontrol edin
   - Development/Production environment farkını kontrol edin

### Debug Endpoints
- `GET /api/health` - Server health check
- Console logs içinde detaylı error messages

## 📜 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 👥 Contributors

### Core Team
- **Taha Unall** - Lead Developer (@unalltaha)
  - Full-stack development
  - Blockchain integration
  - System architecture

- **Dogan Bozkurt** - Frontend Developer (@doganbozkurrt34)
  - UI/UX implementation
  - React components
  - Frontend optimization

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 İletişim & Destek

- **GitHub Issues**: Bug reports ve feature requests
- **Email**: Teknik destek için contributor email'leri
- **Documentation**: Bu README ve kod içi dokümantasyon

---

**Not**: Bu proje sürekli geliştirilmekte olup, yeni özellikler ve iyileştirmeler düzenli olarak eklenmektedir. 