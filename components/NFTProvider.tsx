import "react-native-url-polyfill/auto";
import { useConnection } from "./ConnectionProvider";
import { Account, useAuthorization } from "./AuthProvider";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { useUmi } from "./MetaplexProvider"; // Update this import to match your file structure
import { PublicKey, Umi } from "@metaplex-foundation/umi";

export interface NFTProviderProps {
  children: ReactNode;
}

export interface NFTContextState {
  umi: Umi | null;
  publicKey : PublicKey | null; // The public key of the authorized wallet
  isLoading : boolean;
  loadedNFTs: (Nft | Sft | SftWithToken | NftWithToken)[] | null; // Array of loaded NFTs that contain metadata
}

const DEFAULT_NFT_CONTEXT_STATE: NFTContextState = {
  umi: null,
};

export function formatDate(date: Date) {
    return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
}
  

const NFTContext = createContext<NFTContextState>(DEFAULT_NFT_CONTEXT_STATE);

export function NFTProvider(props: NFTProviderProps) {
  const { children } = props;

  const { connection } = useConnection();
  const { authorizeSession } = useAuthorization();
  const [account, setAccount] = useState<Account | null>(null);
  const { umi } = useUmi(connection, account, authorizeSession);

  const state: NFTContextState = {
    umi,
  };

  return <NFTContext.Provider value={state}>{children}</NFTContext.Provider>;
}

export const useNFT = (): NFTContextState => useContext(NFTContext);