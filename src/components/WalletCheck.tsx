import { useCheckWallets } from '../hooks/useCheckWallets';
import { usePrivy } from '@privy-io/react-auth';

export function WalletCheck() {
  const { ready, solanaWallets, hasSolanaWallet, solanaAddress } = useCheckWallets();
  const { user } = usePrivy();

  if (!ready) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Cüzdan Durumu</h3>
      
      <div className="space-y-1 text-sm">
        <p>
          Kullanıcı: {user?.email || 'Giriş yapılmadı'}
        </p>
        
        {hasSolanaWallet ? (
          <>
            <p className="text-green-600">
              ✓ Solana cüzdanı mevcut
            </p>
            <p className="font-mono text-xs">
              Adres: {solanaAddress}
            </p>
          </>
        ) : (
          <p className="text-red-600">
            ✗ Solana cüzdanı bulunamadı
          </p>
        )}

        {solanaWallets.length > 1 && (
          <p className="text-yellow-600">
            Not: {solanaWallets.length} adet Solana cüzdanı bulundu
          </p>
        )}
      </div>
    </div>
  );
}
