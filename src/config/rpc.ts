import { Connection, ConnectionConfig } from '@solana/web3.js';

const RPC_URL = import.meta.env.VITE_QUICKNODE_RPC_URL;

if (!RPC_URL) {
  throw new Error('Missing QuickNode RPC URL in environment variables');
}

// Configure connection
const config: ConnectionConfig = {
  commitment: 'confirmed',
};

// Create the connection
export const connection = new Connection(RPC_URL, config);

export default connection;
