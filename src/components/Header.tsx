import { Search, Menu } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { useState } from 'react';
import { CreateTokenDialog } from './CreateTokenDialog';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ADMIN_EMAILS } from '@/lib/constants';

const MENU_ITEMS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/portfolio', label: 'Portföy' },
  { href: '/rewards', label: 'Ödüller' },
  { href: '/settings', label: 'Ayarlar' },
];

export function Header() {
  const { login, logout, authenticated, user } = usePrivy();
  const { solBalance } = useWalletBalances();
  const [createTokenOpen, setCreateTokenOpen] = useState(false);

  // Check if user is admin
  const isAdmin = authenticated && user?.email?.address && ADMIN_EMAILS.includes(user.email.address);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden mr-2">
                <Menu className="h-5 w-5 text-white/60" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-black p-6">
              <div className="flex flex-col space-y-4">
                {MENU_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-[#FFE147]",
                      window.location.pathname === item.href ? "text-[#FFE147]" : "text-white/60"
                    )}
                  >
                    {item.label}
                  </a>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => setCreateTokenOpen(true)}
                    className="text-lg font-medium text-white/60 hover:text-[#FFE147] transition-colors text-left"
                  >
                    Token Oluştur
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <a className="flex items-center space-x-2" href="/">
            <Logo className="h-8 w-8 text-[#FFE147]" />
            <span className="font-bold text-xl text-[#FFE147] hidden sm:inline-block">
              KALISTO
            </span>
          </a>

          <div className="hidden lg:flex ml-6">
            <NavigationMenu>
              <NavigationMenuList>
                {MENU_ITEMS.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-[#FFE147]",
                        "bg-transparent focus:bg-white/5 focus:text-[#FFE147] focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        window.location.pathname === item.href ? "text-[#FFE147]" : "text-white/60"
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                {isAdmin && (
                  <NavigationMenuItem>
                    <button
                      onClick={() => setCreateTokenOpen(true)}
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-[#FFE147]",
                        "bg-transparent focus:bg-white/5 focus:text-[#FFE147] focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        "text-white/60"
                      )}
                    >
                      Token Oluştur
                    </button>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[140px] sm:w-[200px] lg:w-[300px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-white/60" />
              <Input
                placeholder="Token ara..."
                className="pl-7 pr-3 py-1 h-8 bg-white/5 border border-white/10 hover:border-[#FFE147]/50 transition-colors rounded-full text-sm text-white placeholder:text-white/40"
              />
            </div>
          </div>
          {authenticated && (
            <div className="flex items-center">
              <div className="text-xs sm:text-sm font-medium text-white/80">
                <span className="text-[#FFE147]">{solBalance?.toFixed(4)}</span> SOL
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="ml-2 bg-transparent border-2 border-[#FFE147] text-[#FFE147] hover:bg-[#FFE147] hover:text-black transition-colors rounded-full px-4"
            onClick={authenticated ? logout : login}
          >
            {authenticated ? 'Çıkış Yap' : 'Giriş Yap'}
          </Button>
        </div>
      </div>

      <CreateTokenDialog 
        open={createTokenOpen}
        onOpenChange={setCreateTokenOpen}
      />
    </header>
  );
}