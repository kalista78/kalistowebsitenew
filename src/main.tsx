import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import './store/initializeStores'; // Initialize stores

import { PrivyProvider } from '@privy-io/react-auth';
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId="cm3hducj402zf5p44sbmdxvg4"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#F7E436'
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
          requireUserPasswordOnCreate: false
        }
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>,
);
