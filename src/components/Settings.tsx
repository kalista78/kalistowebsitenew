import { 
  ArrowRightFromLine, 
  Copy, 
  LogOut, 
  Shield, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';
import { ExportWalletButton } from './ExportWalletButton';

const SECTIONS = [
  {
    title: 'Hesap',
    items: [
      {
        id: 'support-id',
        icon: Shield,
        label: 'Destek ID',
        copyable: true,
        value: 'cm3gok5zrQ3Sr4qQ0fxhqbja'
      },
      {
        id: 'manage-account',
        icon: User,
        label: 'Hesabı Yönet',
        description: 'Hesap giriş yöntemlerini ekle veya güncelle',
        navigable: true
      },
      {
        id: 'logout',
        icon: LogOut,
        label: 'Çıkış Yap',
        destructive: true
      }
    ]
  }
];

export function Settings() {
  const { logout } = usePrivy();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Panoya kopyalandı');
  };

  const handleItemClick = (id: string) => {
    if (id === 'logout') {
      logout();
    }
  };

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="yellow-card border-0 rounded-3xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-medium text-black mb-4">{section.title}</h2>
              <div className="space-y-2">
                <ExportWalletButton />
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors"
                    onClick={() => handleItemClick(item.id)}
                    role={item.destructive || item.navigable ? "button" : undefined}
                    style={{ cursor: item.destructive || item.navigable ? "pointer" : "default" }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-black/60" />
                      <span className={`text-sm ${item.destructive ? 'text-red-600' : 'text-black'}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.copyable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.value);
                        }}
                        className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-black/60" />
                      </button>
                    ) : item.navigable ? (
                      <ArrowRightFromLine className="w-4 h-4 text-black/60" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}