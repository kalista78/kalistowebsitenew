import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { FEATURED_COINS, TokenData } from "@/lib/data";
import { useTokensStore } from "@/store/tokensStore";
import { TokenTradePanel } from "./TokenTradePanel";
import { EditTokenDialog } from "./EditTokenDialog";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Share2, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenChart } from "./TokenChart";
import { TokenTrades } from "./TokenTrades";
import { TokenInfo } from "./TokenInfo";
import { TokenComments } from "./TokenComments";
import { cn } from "@/lib/utils";
import { getTokenMetadata, formatTRY, formatLargeTRY, getUSDToTRYRate } from "@/utils/solana";
import useTokenStore from "@/store/tokenStore";
import { useDexScreener } from "@/hooks/useDexScreener";
import { ADMIN_EMAILS } from '@/lib/constants';

interface TokenMarketData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
}

interface TokenPageProps {
  token: TokenData;
}

export function TokenPage({ token }: TokenPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = usePrivy();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tryRate, setTryRate] = useState<number>(30.5);
  const { tokens, removeToken, getToken } = useTokensStore();
  
  // Find token using the store's getToken method
  const tokenFromStore = id ? getToken(id) : undefined;

  // If token not found in store, check featured coins
  const featuredToken = !tokenFromStore && id ? FEATURED_COINS.find((t) => {
    const urlId = id.toLowerCase();
    // Check symbol first, then fallback to name
    const tokenSymbol = t.symbol?.replace?.('$', '')?.toLowerCase() || '';
    const tokenName = t.name?.replace?.('$', '')?.replace?.(/\s+/g, '')?.toLowerCase() || '';
    return tokenSymbol === urlId || tokenName === urlId;
  }) : undefined;

  const currentToken = token || tokenFromStore || featuredToken;

  // Use our hooks to get token data
  const { tokenData: dexScreenerData, isLoading: isDexScreenerLoading } = useDexScreener(currentToken?.ca || '');
  const { getTokenData, fetchTokenData } = useTokenStore();
  const tokenData = getTokenData((currentToken as any)?.ca || (currentToken as any)?.id || '');

  // Fetch TRY rate and update token data when rate changes
  useEffect(() => {
    const fetchExchangeRate = async () => {
      const rate = await getUSDToTRYRate();
      setTryRate(rate);
      
      // Update token data with new rate
      if ((currentToken as any)?.ca && dexScreenerData) {
        await fetchTokenData((currentToken as any).ca, rate, dexScreenerData);
      }
    };

    fetchExchangeRate(); // Initial fetch
    const rateInterval = setInterval(fetchExchangeRate, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(rateInterval);
  }, [(currentToken as any)?.ca, dexScreenerData, fetchTokenData]);

  // Update token data when DexScreener data changes
  useEffect(() => {
    if ((currentToken as any)?.ca && dexScreenerData && tryRate) {
      fetchTokenData((currentToken as any).ca, tryRate, dexScreenerData);
    }
  }, [(currentToken as any)?.ca, dexScreenerData, tryRate, fetchTokenData]);
  
  if (!currentToken) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-black/60">Token bulunamadı</div>
      </div>
    );
  }

  const isCustomToken = tokens.some(t => t.id === id);
  const isAdmin = user?.email?.address && ADMIN_EMAILS.includes(user.email.address);
  
  const handleDelete = async () => {
    removeToken(id!);
    // Remove from featured coins if present
    const featuredIndex = FEATURED_COINS.findIndex(t => t.id === id);
    if (featuredIndex !== -1) {
      FEATURED_COINS.splice(featuredIndex, 1);
    }
    toast.success("Token başarıyla silindi");
    // Navigate and close dialog
    setIsDeleteDialogOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2 text-white/60 hover:text-white" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Geri
          </Button>
          <div className="flex gap-2">
            {isAdmin && isCustomToken && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Düzenle
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Sil
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Token Info Card */}
            <Card className="yellow-card border-0 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={(currentToken as any).image}
                    alt={(currentToken as any).name}
                    className="w-16 h-16 rounded-xl"
                  />
                  {(currentToken as any).verified && (
                    <Badge className="absolute -bottom-2 -right-2 bg-[#22C55E] hover:bg-[#22C55E] text-white">
                      Verified
                    </Badge>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">{(currentToken as any).name}</h1>
                  <div className="flex items-center gap-2 text-sm text-black/60">
                    <span>{(currentToken as any).symbol}</span>
                    {(currentToken as any).network && (
                      <>
                        <span>•</span>
                        <span>{(currentToken as any).network}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tokenData && (
                  <>
                    <div>
                      <div className="text-sm text-black/60 mb-1">Fiyat (TRY)</div>
                      <div className="text-lg font-medium">
                        {isDexScreenerLoading ? 'Yükleniyor...' : tokenData?.formattedPrice}
                      </div>
                      {tokenData && (
                        <div className={cn(
                          "text-sm font-medium",
                          tokenData.price_change_24h > 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                        )}>
                          {tokenData.formattedPriceChange}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-black/60 mb-1">Market Değeri</div>
                      <div className="text-lg font-medium">
                        {isDexScreenerLoading ? 'Yükleniyor...' : tokenData?.formattedMarketCap}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-black/60 mb-1">24s Hacim</div>
                      <div className="text-lg font-medium">
                        {isDexScreenerLoading ? 'Yükleniyor...' : tokenData?.formattedVolume}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-black/60 mb-1">Likidite</div>
                      <div className="text-lg font-medium">
                        {isDexScreenerLoading ? 'Yükleniyor...' : tokenData?.formattedLiquidity}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Mobile Trading Panel - Only visible on mobile */}
            <div className="lg:hidden">
              <TokenTradePanel token={(currentToken as any)} />
            </div>

            <Tabs defaultValue="chart" className="space-y-6">
              <TabsList className="bg-black/10 border-0 w-full flex">
                <TabsTrigger value="chart" className="flex-1">Grafik</TabsTrigger>
                <TabsTrigger value="trades" className="flex-1">İşlemler</TabsTrigger>
                <TabsTrigger value="info" className="flex-1">Bilgi</TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">Yorumlar</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="m-0">
                <TokenChart contractAddress={(currentToken as any).ca || (currentToken as any).id} />
              </TabsContent>

              <TabsContent value="trades" className="m-0">
                <TokenTrades contractAddress={(currentToken as any).ca || (currentToken as any).id} />
              </TabsContent>

              <TabsContent value="info" className="m-0">
                <div className="space-y-6 yellow-card rounded-3xl p-6">
                  <TokenInfo token={(currentToken as any)} />
                </div>
              </TabsContent>

              <TabsContent value="comments" className="m-0">
                <TokenComments tokenId={(currentToken as any).id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Trading Panel - Only visible on desktop */}
          <div className="hidden lg:block">
            <TokenTradePanel token={(currentToken as any)} />
          </div>
        </div>
      </div>

      <EditTokenDialog
        token={(currentToken as any)}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Token'i silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Token kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Devam Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}