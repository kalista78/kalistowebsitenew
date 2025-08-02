import { PrivyInterface as BasePrivyInterface } from '@privy-io/react-auth';

declare module '@privy-io/react-auth' {
  interface PrivyInterface extends BasePrivyInterface {
    createDelegatedWallet: (options: any) => Promise<any>;
  }
}
