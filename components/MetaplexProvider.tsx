import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { transact, Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useMemo } from "react";
import { Account } from "./AuthProvider";

type LegacyOrVersionedTransact = Transaction | VersionedTransaction;

export const useUmi = (
  connection: Connection,
  selectedAccount: Account | null,
  authorizeSession: (wallet: Web3MobileWallet) => Promise<Account>,
) => {
  return useMemo(() => {
    if (!selectedAccount || !authorizeSession) {
      return { mobileWalletAdapter: null, umi: null };
    }

    const mobileWalletAdapter = {
      publicKey: selectedAccount.publicKey,
      signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
        return await transact(async (wallet: Web3MobileWallet) => {
          await authorizeSession(wallet);
          const signedMessages = await wallet.signMessages({
            addresses: [selectedAccount.publicKey.toBase58()],
            payloads: [message],
          });
          return signedMessages[0];
        });
      },
      signTransaction: async <T extends LegacyOrVersionedTransact>(transaction: T): Promise<T> => {
        return await transact(async (wallet: Web3MobileWallet) => {
          await authorizeSession(wallet);
          const signedTransactions = await wallet.signTransactions({
            transactions: [transaction],
          });
          return signedTransactions[0] as T;
        });
      },
      signAllTransactions: async <T extends LegacyOrVersionedTransact>(transactions: T[]): Promise<T[]> => {
        return transact(async (wallet: Web3MobileWallet) => {
          await authorizeSession(wallet);
          const signedTransactions = await wallet.signTransactions({
            transactions: transactions,
          });
          return signedTransactions as T[];
        });
      },
    };
    // Add Umi Plugins
    const umi = createUmi(connection.rpcEndpoint)
      .use(mplTokenMetadata())
      .use(walletAdapterIdentity(mobileWalletAdapter));

    return { umi };
  }, [authorizeSession, selectedAccount, connection]);
};
