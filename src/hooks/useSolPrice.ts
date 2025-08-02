import { useState, useEffect } from 'react';

const PRICE_UPDATE_INTERVAL = 30 * 1000;

export function useSolPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPrice() {
      if (!mounted) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT',
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch SOL/USDT price');
        }

        const data = await response.json();
        if (mounted && data && !isNaN(data.price)) {
          setPrice(parseFloat(data.price));
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching SOL price:', err);
          setError('Fiyat bilgisi alınamadı');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, PRICE_UPDATE_INTERVAL);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { price, loading, error };
}
