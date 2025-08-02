const { PrivyClient } = require('@privy-io/server-auth');

// Initialize the Privy client with your API key
const privy = new PrivyClient(process.env.PRIVY_API_KEY);

async function pregenerateWallet(accountType, accountAddress) {
  try {
    // Pregenerate a new Solana wallet for a user based on their auth method
    const user = await privy.importUser({
      linkedAccounts: [
        {
          type: accountType, // 'email', 'twitter', etc.
          address: accountAddress,
        },
      ],
      createSolanaWallet: true,
    });
    
    console.log('Successfully pregenerated Solana wallet for user:', user);
    return user;
    
  } catch (error) {
    console.error('Error pregenerating wallet:', error);
    throw error;
  }
}

// Example usage:
// pregenerateWallet('email', 'user@example.com');
// pregenerateWallet('twitter', 'twitter_username');
// pregenerateWallet('discord', 'discord_id');
