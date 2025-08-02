import { useExchangeRateStore } from './exchangeRateStore';
import { useTokensStore } from './tokensStore';

console.log('Initializing stores...'); // Debug log

// Initialize the exchange rate store
export async function initializeStores() {
  console.log('Fetching initial exchange rate...'); // Debug log
  await useExchangeRateStore.getState().fetchRate();
  console.log('Initial exchange rate fetch complete.'); // Debug log

  console.log('Fetching initial tokens...'); // Debug log
  await useTokensStore.getState().fetchTokens();
  console.log('Initial tokens fetch complete.'); // Debug log
}

// Call initialization immediately
initializeStores().catch(error => {
  console.error('Failed to initialize stores:', error);
});
