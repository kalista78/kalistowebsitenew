# Environment Variables Setup Guide

Bu rehber, Kalisto projesini çalıştırabilmek için gerekli environment variable'ların nasıl ayarlanacağını açıklar.

## Frontend Environment Variables (.env)

Proje root klasöründe `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Privy Web3 Authentication
VITE_PRIVY_APP_ID=your_privy_app_id

# Solana RPC Configuration
VITE_QUICKNODE_RPC_URL=your_quicknode_rpc_url

# API Configuration (if different from default)
# VITE_API_URL=http://localhost:3001
```

## Backend Environment Variables (server/.env)

`server` klasöründe `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Privy Server Authentication
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Solana RPC Configuration
QUICKNODE_RPC_URL=your_quicknode_rpc_url

# Server Configuration
NODE_ENV=development
PORT=3001
```

## Gerekli Servis Hesapları

### 1. Supabase
1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Settings → API → Project URL ve anon key'i kopyalayın
4. SQL Editor'de README.md'deki SQL komutlarını çalıştırın

### 2. Privy
1. [Privy](https://privy.io) hesabı oluşturun
2. Yeni bir uygulama oluşturun
3. App ID ve App Secret'ı kopyalayın
4. Solana mainnet'i etkinleştirin

### 3. QuickNode
1. [QuickNode](https://quicknode.com) hesabı oluşturun
2. Solana mainnet endpoint oluşturun
3. HTTP(S) endpoint URL'ini kopyalayın

## Production Environment (Railway/Vercel)

Production ortamında aşağıdaki ek değişkenler gereklidir:

```env
NODE_ENV=production
PORT=3000
VITE_QUICKNODE_RPC_URL=your_production_rpc_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
QUICKNODE_RPC_URL=your_production_rpc_url
```

## Güvenlik Notları

- `.env` dosyalarını asla git repository'sine eklemeyin
- Production secret'larını development ortamında kullanmayın
- API key'lerini düzenli olarak rotate edin
- Environment variable'ları sadece gerekli olan yerlerde kullanın 