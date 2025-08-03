# GitHub Repository Kurulumu

Bu rehber Kalisto projesini GitHub'a nasıl yükleyeceğinizi ve yapılandıracağınızı açıklar.

## 🚀 GitHub Repository Oluşturma

### 1. GitHub'da Yeni Repository Oluşturun

1. [GitHub](https://github.com) hesabınıza giriş yapın
2. Sağ üst köşeden **"New repository"** butonuna tıklayın
3. Repository bilgilerini doldurun:
   - **Repository name**: `kalistowebsite` (veya istediğiniz isim)
   - **Description**: `Solana Token Explorer & DEX Platform - Modern Web3 trading interface`
   - **Visibility**: Public (önerilen) veya Private
   - **Initialize with README**: ❌ İşaretlemeyin (zaten README.md var)
   - **Add .gitignore**: ❌ İşaretlemeyin (zaten .gitignore var)
   - **Choose a license**: ❌ İşaretlemeyin (zaten LICENSE var)

4. **"Create repository"** butonuna tıklayın

### 2. Local Repository'yi GitHub'a Bağlayın

Terminal/Command Prompt'ta proje dizininde şu komutları çalıştırın:

```bash
# GitHub repository'nizi remote olarak ekleyin
git remote add origin https://github.com/YOUR_USERNAME/kalistowebsite.git

# Ana branch'i main olarak değiştirin (modern GitHub standardı)
git branch -M main

# İlk push'ı yapın
git push -u origin main
```

**Not**: `YOUR_USERNAME` kısmını kendi GitHub kullanıcı adınızla değiştirin.

### 3. Repository Ayarlarını Yapılandırın

#### Repository Settings
1. Repository sayfasında **"Settings"** tabına gidin
2. **"General"** bölümünde:
   - **Features**: Issues, Pull requests, Discussions (isteğe bağlı) aktif
   - **Pull Requests**: Allow merge commits, Allow squash merging aktif

#### Branch Protection Rules
1. **"Branches"** bölümüne gidin
2. **"Add rule"** butonuna tıklayın
3. Branch protection rule ekleyin:
   - **Branch name pattern**: `main`
   - **Protect matching branches**:
     - ✅ Require pull request reviews before merging
     - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - ✅ Include administrators

#### Secrets ve Environment Variables
1. **"Secrets and variables"** → **"Actions"** bölümüne gidin
2. **"New repository secret"** ile production secrets ekleyin:
   ```
   PRIVY_APP_SECRET=your_production_privy_secret
   RAILWAY_TOKEN=your_railway_token (Railway deployment için)
   ```

## 🌿 Branch Strategy Kurulumu

### Development Branch Oluşturun

```bash
# Develop branch oluşturun ve geçin
git checkout -b develop
git push -u origin develop

# Feature branch örneği
git checkout -b feature/user-authentication
git push -u origin feature/user-authentication
```

### Branch Yapısı
```
main (production)
├── develop (development)
├── feature/feature-name (yeni özellikler)
├── bugfix/bug-description (bug düzeltmeleri)
└── hotfix/critical-fix (acil düzeltmeler)
```

## 🏷️ GitHub Labels Kurulumu

Repository → Issues → Labels bölümünde şu label'ları oluşturun:

### Priority Labels
- `priority: critical` (🔴 kırmızı)
- `priority: high` (🟠 turuncu) 
- `priority: medium` (🟡 sarı)
- `priority: low` (🟢 yeşil)

### Type Labels
- `type: bug` (🐛 kırmızı)
- `type: feature` (✨ mavi)
- `type: enhancement` (💡 yeşil)
- `type: documentation` (📚 mor)
- `type: refactor` (♻️ gri)

### Component Labels
- `frontend` (🎨 mavi)
- `backend` (⚙️ siyah)
- `database` (🗄️ mor)
- `blockchain` (⛓️ turuncu)

### Status Labels
- `status: in-progress` (🔄 sarı)
- `status: needs-review` (👀 mavi)
- `status: blocked` (🚧 kırmızı)

## 🤖 GitHub Actions Secrets

CI/CD pipeline'ının çalışması için şu secrets'ları ekleyin:

### Repository Secrets
```bash
# Production deployment
PRIVY_APP_SECRET=your_production_privy_app_secret
RAILWAY_TOKEN=your_railway_deployment_token

# Optional: Automated testing
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
TEST_WALLET_PRIVATE_KEY=your_test_wallet_private_key
```

### Environment Variables (public)
```bash
NODE_ENV=production
VITE_SUPABASE_URL=your_supabase_url
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_QUICKNODE_RPC_URL=your_rpc_url
```

## 📋 Repository Templates

### Issue Templates
- ✅ Bug report template (.github/ISSUE_TEMPLATE/bug_report.md)
- ✅ Feature request template (.github/ISSUE_TEMPLATE/feature_request.md)

### PR Template
- ✅ Pull request template (.github/pull_request_template.md)

### Workflows
- ✅ CI/CD pipeline (.github/workflows/ci.yml)

## 🔗 External Integrations

### Railway Deployment
1. [Railway](https://railway.app) hesabınıza giriş yapın
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Repository'nizi seçin
4. Environment variables'ları ekleyin
5. Deploy butonuna tıklayın

### GitHub Pages (Optional)
Dokümantasyon sitesi için:
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, folder: /docs (eğer docs klasörü oluşturursanız)

## 📊 Project Management

### GitHub Projects (v2)
1. Repository → Projects → **"New project"**
2. Template: **"Team planning"**
3. Views oluşturun:
   - **Board**: Kanban board görünümü
   - **Table**: Tablo görünümü
   - **Roadmap**: Timeline görünümü

### Milestones
1. Repository → Issues → Milestones
2. Milestone'lar oluşturun:
   - **v1.1.0**: Mobile responsiveness improvements
   - **v1.2.0**: Advanced trading features
   - **v1.3.0**: Multi-language support

## 🔒 Security Setup

### Security Advisories
1. Repository → Security → Advisories
2. **"Enable private vulnerability reporting"**

### Dependabot
1. Repository → Security → Dependabot
2. **"Enable Dependabot alerts"**
3. **"Enable Dependabot security updates"**

### Code Scanning
1. Repository → Security → Code scanning
2. **"Set up code scanning"**
3. CodeQL analysis workflow'ü aktifleştirin

## 📞 Team Collaboration

### Collaborators
1. Repository → Settings → Collaborators
2. Team members'ları ekleyin:
   - `@unalltaha` (Owner)
   - `@doganbozkurrt34` (Collaborator)

### Team Permissions
- **Admin**: Full access
- **Write**: Push, pull, issues, PRs
- **Read**: Pull, issues

## 📈 GitHub Insights

### Community Standards
Repository → Insights → Community → **"Add"** bölümünden eksik dosyaları ekleyin:
- ✅ README.md
- ✅ LICENSE
- ✅ CONTRIBUTING.md
- ✅ CODE_OF_CONDUCT.md (isteğe bağlı)
- ✅ Issue templates
- ✅ Pull request template

## 🎯 Next Steps

1. ✅ Repository oluşturuldu
2. ✅ Initial commit push edildi
3. ⏳ Branch protection rules ayarlandı
4. ⏳ GitHub Actions secrets eklendi
5. ⏳ Team members invite edildi
6. ⏳ Project board oluşturuldu
7. ⏳ Railway deployment yapılandırıldı

---

**Tebrikler! 🎉 GitHub repository'niz başarıyla kuruldu ve yapılandırıldı!**

Sorularınız için: [@unalltaha](https://github.com/unalltaha) veya [@doganbozkurrt34](https://github.com/doganbozkurrt34) 