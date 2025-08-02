# Contributing to Kalisto

Kalisto projesine katkıda bulunduğunuz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 🚀 Başlangıç

### Gereksinimler
- Node.js (v18+)
- npm veya yarn
- Git

### Development Setup

1. Repository'yi fork edin ve klonlayın:
```bash
git clone https://github.com/YOUR_USERNAME/kalistowebsite.git
cd kalistowebsite
```

2. Dependencies yükleyin:
```bash
npm install
cd server && npm install && cd ..
```

3. Environment variables ayarlayın:
   - `ENV_SETUP.md` dosyasındaki talimatları takip edin

4. Development server'ları başlatın:
```bash
# Terminal 1: Backend
npm run api

# Terminal 2: Frontend  
npm run dev
```

## 🔧 Geliştirme Süreci

### Branch Strategy

- `main`: Production ready kod
- `develop`: Development branch
- `feature/feature-name`: Yeni özellikler
- `bugfix/bug-description`: Bug fix'ler
- `hotfix/critical-fix`: Acil düzeltmeler

### Commit Convention

Semantic commit messages kullanın:

```
type(scope): description

Examples:
feat(token): add token creation functionality
fix(swap): resolve Jupiter swap issue
docs(readme): update installation guide
style(ui): improve button styling
refactor(hooks): optimize wallet hooks
test(api): add token API tests
```

Types:
- `feat`: Yeni özellik
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon
- `style`: Kod formatlaması
- `refactor`: Kod düzenlemesi
- `test`: Test ekleme/düzenleme
- `chore`: Build/config değişiklikleri

### Code Style

- **TypeScript**: Strict mode kullanın
- **ESLint**: Kod kalitesi için
- **Prettier**: Kod formatlama için (önerilen)
- **Naming**: camelCase for variables, PascalCase for components

```typescript
// ✅ Good
const userWallet = useWallet();
const TokenComponent = () => { ... };

// ❌ Bad
const user_wallet = useWallet();
const tokenComponent = () => { ... };
```

## 🐛 Bug Reports

Bug raporu açarken aşağıdaki bilgileri ekleyin:

```markdown
**Bug Açıklaması**
Kısa ve net açıklama

**Adımlar**
1. Git to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Beklenen Davranış**
Ne olmasını bekliyordunuz

**Screenshots**
Varsa ekran görüntüleri

**Environment:**
 - OS: [e.g. Windows 10]
 - Browser: [e.g. Chrome 96]
 - Node Version: [e.g. 18.17.0]
```

## ✨ Feature Requests

Yeni özellik önerirken:

1. **Issue Template** kullanın
2. **Use case** açıklayın
3. **Mockup/wireframe** ekleyin (varsa)
4. **Implementation ideas** paylaşın

## 🔍 Pull Request Process

### PR Checklist

- [ ] Branch `develop`'den oluşturuldu
- [ ] Commits semantic convention'a uygun
- [ ] Code review için hazır
- [ ] Tests yazıldı (varsa)
- [ ] Documentation güncellendi
- [ ] Breaking changes yok (varsa belirtildi)

### PR Template

```markdown
## Değişiklik Türü
- [ ] Bug fix
- [ ] Yeni özellik
- [ ] Breaking change
- [ ] Documentation update

## Açıklama
Bu PR'da yapılan değişiklikleri açıklayın...

## Test Edilen Durumlar
- [ ] Test case 1
- [ ] Test case 2

## Screenshots (varsa)
Değişikliklerin görselleri

## Ek Notlar
Reviewers için önemli bilgiler
```

## 🏗️ Architecture Guidelines

### Frontend Structure
```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── store/         # Zustand stores
├── lib/           # Utilities
├── types/         # TypeScript types
└── utils/         # Helper functions
```

### Component Guidelines

```typescript
// ✅ Good Component Structure
interface TokenCardProps {
  token: Token;
  onSelect: (token: Token) => void;
}

export function TokenCard({ token, onSelect }: TokenCardProps) {
  // Hooks at the top
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers
  const handleClick = () => {
    onSelect(token);
  };
  
  // Early returns
  if (!token) return null;
  
  // Render
  return (
    <div onClick={handleClick}>
      {/* JSX */}
    </div>
  );
}
```

### State Management

- **Zustand** for global state
- **useState** for component state
- **Custom hooks** for complex logic

```typescript
// ✅ Good Store Structure
interface TokenState {
  tokens: Token[];
  isLoading: boolean;
  
  // Actions
  fetchTokens: () => Promise<void>;
  addToken: (token: Token) => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  tokens: [],
  isLoading: false,
  
  fetchTokens: async () => {
    set({ isLoading: true });
    // Implementation
    set({ isLoading: false });
  },
  
  addToken: (token) => set((state) => ({ 
    tokens: [...state.tokens, token] 
  })),
}));
```

## 🧪 Testing

### Test Structure
```bash
# Unit tests
npm test

# E2E tests (if available)
npm run test:e2e

# Linting
npm run lint
```

### Test Guidelines

```typescript
// ✅ Good Test Structure
describe('TokenCard', () => {
  it('should render token information', () => {
    const mockToken = { id: '1', name: 'Test Token' };
    render(<TokenCard token={mockToken} onSelect={jest.fn()} />);
    
    expect(screen.getByText('Test Token')).toBeInTheDocument();
  });
  
  it('should call onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    const mockToken = { id: '1', name: 'Test Token' };
    
    render(<TokenCard token={mockToken} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText('Test Token'));
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockToken);
  });
});
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Fetches token data from Jupiter API
 * @param tokenAddress - The token's contract address
 * @param retries - Number of retry attempts (default: 3)
 * @returns Promise<TokenData | null>
 */
export async function fetchTokenData(
  tokenAddress: string, 
  retries = 3
): Promise<TokenData | null> {
  // Implementation
}
```

### README Updates

- Yeni özellikler eklendiğinde README.md'yi güncelleyin
- API değişiklikleri için endpoint'leri güncelleyin
- Kurulum adımları değişirse dokümantasyonu güncelleyin

## 🚀 Deployment

### Staging
- `develop` branch'e merge edildiğinde otomatik deploy
- Staging URL: TBD

### Production
- `main` branch'e merge edildiğinde otomatik deploy
- Railway üzerinden production'a deploy

## ❓ Sorular

Sorularınız için:

1. **GitHub Issues**: Genel sorular için
2. **Discord/Slack**: Hızlı yardım için (TBD)
3. **Email**: unalltaha@gmail.com veya doganbozkurrt34@gmail.com

## 📋 Issue Labels

- `bug`: Bug reports
- `enhancement`: Yeni özellik önerileri
- `documentation`: Dokümantasyon iyileştirmeleri
- `good first issue`: Yeni contributor'lar için
- `help wanted`: Yardım aranan konular
- `priority: high`: Yüksek öncelikli
- `priority: low`: Düşük öncelikli

## 🎯 Roadmap

Projenin gelecek planları için GitHub Projects'i takip edin.

---

**Katkıda bulunduğunuz için tekrar teşekkürler! 🙏** 