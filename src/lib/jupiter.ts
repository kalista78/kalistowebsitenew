// This will fetch and format price data from Jupiter
export async function getTokenPrice(tokenMint: string) {
  const response = await fetch(`https://price.jup.ag/v4/price?ids=${tokenMint}`);
  return response.json();
} 