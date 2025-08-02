import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, ExternalLink, Globe, Twitter, MessageCircle, Shield, Settings2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useJupiterSwap } from '@/hooks/useJupiterSwap';
import { useBalanceStore } from '@/store/useBalanceStore';
import { toast } from 'sonner';

const QUICK_AMOUNTS = [0.1, 0.5, 1, 2];
const PERCENTAGES = [25, 50, 75, 100];
const QUICK_SLIPPAGES = [0.1, 0.5, 1.0, 2.0];
const PRIORITY_LEVELS = [
  { label: 'Düşük', percentile: 25 },
  { label: 'Orta', percentile: 50 },
  { label: 'Yüksek', percentile: 75 },
  { label: 'Çok Yüksek', percentile: 95 }
] as const;

interface TokenTradePanelProps {
  token: {
    name: string;
    ca?: string;
    decimals?: number;
    socialLinks?: {
      twitter?: string;
      telegram?: string;
      discord?: string;
      website?: string;
    };
  };
}

export function TokenTradePanel({ token }: TokenTradePanelProps) {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { solBalance, tokenBalances } = useBalanceStore();
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [inputType, setInputType] = useState<'amount' | 'percentage'>('amount');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [slippage, setSlippage] = useState('1.0');
  const [customSlippage, setCustomSlippage] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<typeof PRIORITY_LEVELS[number]>(PRIORITY_LEVELS[1]); // Default to Medium

  const { loading: swapLoading, quote, getQuote, executeSwap } = useJupiterSwap({
    tokenCA: token.ca,
    decimals: token.decimals
  });

  // Get token balance
  const tokenBalance = token.ca ? tokenBalances.find(t => t.mint === token.ca)?.amount || 0 : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      const checkWallet = async () => {
        if (authenticated && wallets.length > 0) {
          const solanaWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
          setIsWalletReady(!!solanaWallet);
        }
      };
      checkWallet();
    }, 1000);

    return () => clearTimeout(timer);
  }, [authenticated, wallets]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || !token.ca || isNaN(parseFloat(amount))) {
        console.log('Skipping quote: Invalid input', { amount, tokenCA: token.ca });
        return;
      }
      
      try {
        const parsedAmount = parseFloat(amount);
        if (parsedAmount <= 0) {
          console.log('Skipping quote: Amount too small', { parsedAmount });
          return;
        }
        
        // If using percentage, calculate actual amount
        let actualAmount = parsedAmount;
        if (inputType === 'percentage') {
          const availableBalance = tradeType === 'buy' ? solBalance : tokenBalance;
          actualAmount = (parsedAmount / 100) * availableBalance;
          console.log('Calculated amount from percentage', { 
            percentage: parsedAmount,
            balance: availableBalance,
            actualAmount 
          });
        }
        
        console.log('Fetching quote with params:', {
          amount: actualAmount,
          isBuy: tradeType === 'buy',
          tokenDecimals: token.decimals
        });
        
        await getQuote(actualAmount, tradeType === 'buy');
      } catch (error: any) {
        console.error('Error fetching quote:', error);
        if (error.message === 'Amount too small') {
          toast.error('Amount is too small');
        } else if (error.message === 'Could not find any route') {
          toast.error('No available trading route found');
        } else {
          toast.error('Failed to get quote');
        }
      }
    };

    // Debounce the quote fetching to avoid too many API calls
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, tradeType, token.ca, inputType, solBalance, tokenBalance]);

  const getCurrency = () => {
    if (inputType === 'percentage') return '%';
    if (tradeType === 'sell') return token.name;
    return 'SOL';
  };

  const getPlaceholder = () => {
    if (inputType === 'percentage') return '%0';
    if (tradeType === 'sell') return `0 ${token.name}`;
    return '0 SOL';
  };

  const formatAmount = (value: number) => {
    if (inputType === 'percentage') return `%${value}`;
    if (tradeType === 'sell') return `${value}`;
    return `${value} SOL`;
  };

  const formatExpectedOutput = (output: string | undefined) => {
    if (!output) return '';
    
    const formatNumber = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
        useGrouping: true
      }).format(value);
    };
    
    // For buy orders (getting token), use token decimals
    // For sell orders (getting SOL), use 9 decimals (SOL)
    const value = tradeType === 'buy'
      ? Number(output) / Math.pow(10, token.decimals || 9)  // Use token decimals or fallback to 9
      : Number(output) / Math.pow(10, 9); // SOL has 9 decimals
    
    return formatNumber(value);
  };

  const calculateActualAmount = (inputAmount: number, isPercentage: boolean) => {
    if (!isPercentage) return inputAmount;
    
    const availableBalance = tradeType === 'buy' ? solBalance : tokenBalance;
    // If percentage is 100, use 99.9 instead to leave room for fees
    const adjustedPercentage = inputAmount === 100 ? 99.9 : inputAmount;
    return (adjustedPercentage / 100) * availableBalance;
  };

  const handleSubmit = async () => {
    if (!amount || !token.ca || isNaN(parseFloat(amount))) {
      console.log('Invalid input for swap:', { amount, tokenCA: token.ca });
      toast.error('Please enter a valid amount');
      return;
    }

    if (!authenticated) {
      console.log('User not authenticated');
      toast.error('Please connect your wallet first');
      return;
    }

    const parsedAmount = parseFloat(amount);
    const availableBalance = tradeType === 'buy' ? solBalance : tokenBalance;
    const actualAmount = calculateActualAmount(parsedAmount, inputType === 'percentage');

    console.log('Attempting swap with:', {
      parsedAmount,
      availableBalance,
      tradeType,
      tokenDecimals: token.decimals,
      tokenCA: token.ca,
      inputType,
      actualAmount,
      isMaxAmount: parsedAmount === 100 && inputType === 'percentage',
      slippageBps: Math.round(parseFloat(slippage) * 100),
      priorityLevel: priorityLevel.label
    });

    // Check if actual amount exceeds balance
    if (actualAmount > availableBalance) {
      console.log('Insufficient balance:', {
        requested: actualAmount,
        available: availableBalance,
        token: tradeType === 'buy' ? 'SOL' : token.name
      });
      toast.error(`Insufficient ${tradeType === 'buy' ? 'SOL' : token.name} balance`);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await executeSwap(
        actualAmount, 
        tradeType === 'buy',
        Math.round(parseFloat(slippage) * 100),
        priorityLevel.label
      );
      
      // Enhanced success notification
      toast.success(
        <div className="flex flex-col gap-1">
          <div>Trade executed successfully!</div>
          <div className="text-sm opacity-80">
            {tradeType === 'buy' 
              ? `Bought ${token.name} for ${actualAmount} SOL`
              : `Sold ${actualAmount} ${token.name} for SOL`}
          </div>
          <div className="text-xs opacity-60">
            Priority Level: {priorityLevel.label}
          </div>
          <a 
            href={`https://solscan.io/tx/${result.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline opacity-60 hover:opacity-100"
          >
            View on Solscan
          </a>
        </div>
      );
      
      setAmount('');
    } catch (error) {
      console.error('Trade failed:', error);
      toast.error(error instanceof Error ? error.message : 'Trade failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmountClick = (value: number) => {
    setAmount(value.toString());
    if (inputType === 'percentage') {
      const actualAmount = calculateActualAmount(value, true);
      console.log('Quick amount click in percentage mode:', {
        percentage: value,
        actualAmount,
        isMaxAmount: value === 100
      });
      getQuote(actualAmount, tradeType === 'buy');
    } else {
      getQuote(value, tradeType === 'buy');
    }
  };

  if (!authenticated) {
    return (
      <Card className="border-0 bg-[#FFE147] text-black p-6 rounded-3xl">
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-medium">İşlem yapmak için giriş yapın</h2>
          <p className="text-black/60">
            Bu token ile işlem yapmak için hesabınıza giriş yapmanız gerekiyor.
          </p>
          <Button 
            className="w-full h-14 bg-black text-white rounded-full hover:bg-black/90"
            onClick={login}
          >
            Giriş Yap
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[#FFE147] text-black p-6 rounded-3xl space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-medium">İşlem Yap</h2>

          {/* Trade Type Toggle */}
          <div className="bg-black/10 p-1 rounded-full flex">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-full h-12 text-base font-medium relative",
                tradeType === 'buy' ? "bg-black text-white" : "hover:bg-black/5"
              )}
              onClick={() => setTradeType('buy')}
            >
              {tradeType === 'buy' && (
                <ArrowDown className="absolute left-4 h-5 w-5" />
              )}
              AL
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-full h-12 text-base font-medium relative",
                tradeType === 'sell' ? "bg-black text-white" : "hover:bg-black/5"
              )}
              onClick={() => setTradeType('sell')}
            >
              {tradeType === 'sell' && (
                <ArrowUp className="absolute left-4 h-5 w-5" />
              )}
              SAT
            </Button>
          </div>

          {/* Balance Display */}
          <div className="text-sm text-black/60">
            {tradeType === 'buy' ? (
              <div>SOL Bakiyesi: {solBalance.toFixed(4)} SOL</div>
            ) : (
              <div>{token.name} Bakiyesi: {tokenBalance.toFixed(4)} {token.name}</div>
            )}
          </div>

          {/* Input Type Selector */}
          <Tabs defaultValue="amount" className="w-full" onValueChange={(value) => setInputType(value as 'amount' | 'percentage')}>
            <TabsList className="grid w-full grid-cols-2 bg-black/10 p-1 rounded-full">
              <TabsTrigger
                value="amount"
                className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Miktar
              </TabsTrigger>
              <TabsTrigger
                value="percentage"
                className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Yüzde
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount/Percentage Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ne kadar?</label>
            <div className="relative">
              <Input
                type="text"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (inputType === 'percentage') {
                    // Only allow numbers between 0-100 for percentage
                    if (!value || (Number(value) >= 0 && Number(value) <= 100)) {
                      setAmount(value);
                      if (value) {
                        const availableBalance = tradeType === 'buy' ? solBalance : tokenBalance;
                        const actualAmount = (Number(value) / 100) * availableBalance;
                        getQuote(actualAmount, tradeType === 'buy');
                      }
                    }
                  } else {
                    setAmount(value);
                  }
                }}
                className="h-14 bg-black/10 border-0 rounded-2xl pr-20 text-lg focus-visible:ring-0"
                placeholder={getPlaceholder()}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/60 font-medium">
                {getCurrency()}
              </span>
            </div>
          </div>

          {/* Expected Output Display */}
          {quote && (
            <div className="mt-2 text-sm text-black/60">
              Expected {tradeType === 'buy' ? token.name : 'SOL'}: {formatExpectedOutput(quote.expectedOutput)}
              {quote.priceImpact > 0 && quote.priceImpact > 10 && (
                <div className="text-red-500 mt-1">
                  Warning: High price impact ({quote.priceImpact.toFixed(2)}%)
                </div>
              )}
            </div>
          )}

          {/* Slippage Settings */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">İşlem Ayarları</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-black/5"
                onClick={() => setShowSlippageSettings(!showSlippageSettings)}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
            
            {showSlippageSettings && (
              <div className="mt-2 space-y-4">
                {/* Slippage Settings */}
                <div className="space-y-2">
                  <div className="text-sm text-black/60">Kayma Toleransı</div>
                  <div className="flex gap-2">
                    {QUICK_SLIPPAGES.map((value) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex-1 bg-transparent border-2 rounded-full hover:bg-black/5",
                          slippage === value.toString() 
                            ? "border-black/60 bg-black/5" 
                            : "border-black/20"
                        )}
                        onClick={() => {
                          setSlippage(value.toString());
                          setCustomSlippage('');
                        }}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      value={customSlippage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          if (parseFloat(value) <= 50) {
                            setCustomSlippage(value);
                            setSlippage(value);
                          }
                        }
                      }}
                      className="h-10 bg-black/10 border-0 rounded-2xl pr-8"
                      placeholder="Özel"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60">
                      %
                    </span>
                  </div>
                </div>

                {/* Priority Fee Settings */}
                <div className="space-y-2">
                  <div className="text-sm text-black/60">İşlem Önceliği</div>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_LEVELS.map((level) => (
                      <Button
                        key={level.label}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "bg-transparent border-2 rounded-full hover:bg-black/5",
                          priorityLevel.label === level.label 
                            ? "border-black/60 bg-black/5" 
                            : "border-black/20"
                        )}
                        onClick={() => setPriorityLevel(level)}
                      >
                        <Zap className={cn(
                          "h-3 w-3 mr-1",
                          level.label === 'Yüksek' || level.label === 'Çok Yüksek' 
                            ? "text-orange-500" 
                            : "text-black/60"
                        )} />
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Warnings */}
                {parseFloat(slippage) > 2 && (
                  <div className="text-orange-500 text-sm">
                    Uyarı: Yüksek kayma toleransı fiyat etkisi riskini artırır
                  </div>
                )}
                {parseFloat(slippage) > 5 && (
                  <div className="text-red-500 text-sm">
                    Uyarı: Çok yüksek kayma toleransı, işlem ön koşulabilir
                  </div>
                )}
                {(priorityLevel.label === 'Yüksek' || priorityLevel.label === 'Çok Yüksek') && (
                  <div className="text-orange-500 text-sm">
                    Uyarı: Yüksek öncelik ücreti işlem maliyetini artıracak
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex flex-wrap gap-2">
            {(inputType === 'amount' ? QUICK_AMOUNTS : PERCENTAGES).map((value) => (
              <Button
                key={value}
                variant="outline"
                className="bg-transparent border-2 border-black/20 rounded-full hover:bg-black/5 hover:border-black/40 text-black/80"
                onClick={() => handleQuickAmountClick(value)}
              >
                {formatAmount(value)}
              </Button>
            ))}
          </div>

          {/* Continue Button */}
          <Button 
            className="w-full h-14 bg-black text-white rounded-full hover:bg-black/90 mt-6"
            onClick={handleSubmit}
            disabled={isSubmitting || swapLoading || !amount}
          >
            {isSubmitting ? 'İşlem yapılıyor...' : 'DEVAM ET'}
          </Button>
        </div>
      </Card>

      {/* Social Links Card */}
      <Card className="border-0 bg-[#F7E436] text-black p-6 rounded-3xl">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Sosyal Medya & Linkler</h2>
          <div className="space-y-3">
            {token.socialLinks?.twitter && (
              <a 
                href={token.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-black/10 rounded-2xl hover:bg-black/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Twitter className="h-5 w-5" />
                  <span className="font-medium">Twitter</span>
                </div>
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
            
            {token.socialLinks?.telegram && (
              <a 
                href={token.socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-black/10 rounded-2xl hover:bg-black/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">Telegram</span>
                </div>
                <ExternalLink className="h-5 w-5" />
              </a>
            )}

            {token.socialLinks?.website && (
              <a 
                href={token.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-black/10 rounded-2xl hover:bg-black/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">Website</span>
                </div>
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>

          {token.ca && (
            <>
              <Separator className="bg-black/10" />

              {/* Security Link */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Güvenlik</span>
                  </div>
                  <a 
                    href={`https://rugcheck.xyz/tokens/${token.ca}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black/60 hover:text-black flex items-center gap-1"
                  >
                    Daha fazla <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}