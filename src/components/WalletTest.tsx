import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const API_URL = 'http://localhost:3001';

export function WalletTest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePregenerate = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pregenerate-solana-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create wallet');
      }

      const data = await response.json();
      
      toast.success('Wallet pregenerated successfully!', {
        description: `Wallet address: ${data.address}`,
      });
      
      console.log('Pregenerated wallet:', data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to pregenerate wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Wallet Pregeneration Test</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Email Address</label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button 
          onClick={handlePregenerate} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Pregenerate Wallet'}
        </Button>
      </div>
    </Card>
  );
} 