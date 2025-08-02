import { Card } from '@/components/ui/card';
import { useEffect } from 'react';

interface TokenChartProps {
  contractAddress: string;
}

export function TokenChart({ contractAddress }: TokenChartProps) {
  useEffect(() => {
    // Add the styles to the document head
    const style = document.createElement('style');
    style.textContent = `
      #dexscreener-embed{
        position:relative;
        width:100%;
        padding-bottom:125%;
      }
      @media(min-width:1400px){
        #dexscreener-embed{
          padding-bottom:65%;
        }
      }
      #dexscreener-embed iframe{
        position:absolute;
        width:100%;
        height:100%;
        top:0;
        left:0;
        border:0;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div id="dexscreener-embed">
      <iframe 
        src={`https://dexscreener.com/solana/${contractAddress}?embed=1&trades=0&chart=1&info=0&tabs=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15m`}
        title="DexScreener Chart"
      />
    </div>
  );
}