// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
// import { Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
// import { Connection } from "@solana/web3.js";
// import { useMemo } from "react";
// import { Account } from "../utils/useAuthorization";

// export const useUmi = (
//   connection: Connection,
//   selectedAccount: Account | null,
//   authorizeSession: (wallet: Web3MobileWallet) => Promise<Account>,
// ) => {
//   return useMemo(() => {
//     if (!selectedAccount || !authorizeSession) {
//       return { umi: null };
//     }

//     // Add Umi Plugins
//     const umi = createUmi(connection.rpcEndpoint)
//       .use(mplTokenMetadata())

//     return { umi };
//   }, [authorizeSession, selectedAccount, connection]);
// };
