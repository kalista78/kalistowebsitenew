import { useEffect } from 'react';

interface TokenTradesProps {
  contractAddress: string;
}

export function TokenTrades({ contractAddress }: TokenTradesProps) {
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
        src={`https://dexscreener.com/solana/${contractAddress}?embed=1&trades=1&info=0&chart=0&theme=dark`}
        title="DexScreener Trades"
      />
    </div>
  );
}