import "react-native-url-polyfill/auto";
import { useConnection } from "./ConnectionProvider";
import { Account, useAuthorization } from "./AuthProvider";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { useUmi } from "./MetaplexProvider";
import { publicKey, Umi, PublicKey, generateSigner } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol";
import { Nft } from "../types";
import RNFetchBlob from "rn-fetch-blob";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";

export interface NFTProviderProps {
  children: ReactNode;
}

export interface NFTContextState {
  umi: Umi | null; // Holds the Umi object that we use to call `fetch` and `create` on.
  publicKey: PublicKey | null; // The public key of the authorized wallet
  isLoading: boolean; // Loading state
  loadedNFTs: (any)[] | null; // Array of loaded NFTs that contain metadata
  nftOfTheDay: (any) | null; // The NFT snapshot created on the current day
  connect: () => void; // Connects (and authorizes) us to the Devnet-enabled wallet
  fetchNFTs: () => void; // Fetches the NFTs using the `metaplex` object
  createNFT: (name: string, description: string, fileUri: string) => void; // Creates the NFT
}

const DEFAULT_NFT_CONTEXT_STATE: NFTContextState = {
  umi: createUmi(clusterApiUrl("devnet")),
  publicKey: null,
  isLoading: false,
  loadedNFTs: null,
  nftOfTheDay: null,
  connect: () => publicKey("00000000000000000000000000000000"), // Default PublicKey
  fetchNFTs: () => { },
  createNFT: (name: string, description: string, fileUri: string) => { },
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
  const [nftOfTheDay, setNftOfTheDay] = useState<Nft | null>(null);
  const [loadedNFTs, setLoadedNFTs] = useState<Nft[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { umi } = useUmi(connection, account, authorizeSession);
  const connect = () => {
    if (isLoading) return;

    setIsLoading(true);
    transact(async wallet => {
      const auth = await authorizeSession(wallet);
      setAccount(auth);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const fetchNFTs = async() => {
    if (!umi || !account?.publicKey) return;

    setIsLoading(true);
   

    
  };

  const uploadImage = async (fileUri: string): Promise<string> => {
    const imageBytesInBase64: string = await RNFetchBlob.fs.readFile(
      fileUri,
      "base64",
    );
    const bytes = Buffer.from(imageBytesInBase64, "base64");

    const response = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_STORAGE_API}`,
        "Content-Type": "image/jpg",
      },
      body: bytes,
    });

    const data = await response.json();
    const cid = data.value.cid;

    return cid as string;
  };

  const uploadMetadata = async (
    name: string,
    description: string,
    imageCID: string,
  ): Promise<string> => {
    const response = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_STORAGE_API}`,
      },
      body: JSON.stringify({
        name,
        description,
        image: `https://ipfs.io/ipfs/${imageCID}`,
      }),
    });

    const data = await response.json();
    const cid = data.value.cid;

    return cid;
  };

  const createNFT = async (
    name: string,
    description: string,
    fileUri: string,
  ) => {
    if (!umi || !account || isLoading) return;
    const mint = generateSigner(umi);

    setIsLoading(true);
    try {
      const imageCID = await uploadImage(fileUri);
      const metadataCID = await uploadMetadata(name, description, imageCID);

      const { signature, result } = await createNft(umi, {
        mint,
        name: "My NFT",
        metadataCID,
        updateAuthority: umi.identity.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
      }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

      setNftOfTheDay(nft.nft);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

    
  const state = {};

  return <NFTContext.Provider value={state}>{children}</NFTContext.Provider>;
}

export const useNFT = (): NFTContextState => useContext(NFTContext);

