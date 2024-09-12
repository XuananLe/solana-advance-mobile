import "react-native-url-polyfill/auto";
import React, { ReactNode, createContext, useContext, useState, useCallback, useMemo } from "react";
import { useConnection } from "./ConnectionProvider";
import { Account, useAuthorization } from "./AuthProvider";
import { useUmi } from "./MetaplexProvider";
import { publicKey, Umi, PublicKey, generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol";
import * as web3 from "@solana/web3.js";
import RNFetchBlob from "rn-fetch-blob";
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { createNft, DigitalAsset, fetchAllDigitalAssetByCreator, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { PinataSDK } from "pinata-web3";

export interface NFTProviderProps {
  children: ReactNode;
}

export interface NFTContextState {
  umi: Umi | null; // Holds the Umi object that we use to call `fetch` and `create` on.
  publicKey: PublicKey | null; // The public key of the authorized wallet
  isLoading: boolean; // Loading state
  loadedNFTs: (DigitalAsset)[] | null; // Array of loaded NFTs that contain metadata
  nftOfTheDay: (DigitalAsset) | null; // The NFT snapshot created on the current day
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
  createNFT: () => { },
};

export function formatDate(date: Date) {
  return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
}

const NFTContext = createContext<NFTContextState>(DEFAULT_NFT_CONTEXT_STATE);

export function NFTProvider(props: NFTProviderProps) {
  const pinata = useMemo(() => new PinataSDK({
    pinataJwt: process.env.EXPO_PUBLIC_PINATA_JWT,
    pinataGateway: process.env.EXPO_PUBLIC_PINATA_GATEWAY,
  }), []);

  const ipfsPrefix = `https://${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/`;
  const { connection } = useConnection();
  const { authorizeSession } = useAuthorization();
  const [account, setAccount] = useState<Account | null>(null);
  const [nftOfTheDay, setNftOfTheDay] = useState<DigitalAsset | null>(null);
  const [loadedNFTs, setLoadedNFTs] = useState<DigitalAsset[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { umi } = useUmi(connection, account, authorizeSession);
  const { children } = props;

 const connect = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    transact(async (wallet) => {
      const auth = await authorizeSession(wallet);
      setAccount(auth);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [isLoading, authorizeSession]);


  const fetchNFTs = useCallback(async () => {
    if (!umi || !account || isLoading) return;
    setIsLoading(true);

    try {
      const creatorPublicKey = fromWeb3JsPublicKey(account.publicKey);
      const nfts = await fetchAllDigitalAssetByCreator(umi, creatorPublicKey);
      setLoadedNFTs(nfts);
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [umi, account, isLoading]);
  const uploadImage = useCallback(async (fileUri: string): Promise<string> => {
    const imageBytesInBase64 = await RNFetchBlob.fs.readFile(fileUri, "base64");
    const upload = await pinata.upload.base64(imageBytesInBase64);
    return upload.IpfsHash;
  }, [pinata]);


  const uploadMetadata = useCallback(async (
    name: string,
    description: string,
    imageCID: string,
  ): Promise<string> => {
    const upload = await pinata.upload.json({ name, description, imageCID });
    return upload.IpfsHash;
  }, [pinata]);


  const createNFT = useCallback(async (
    name: string,
    description: string,
    fileUri: string,
  ) => {
    if (!umi || !account || isLoading) return;
    setIsLoading(true);
    try {
      console.log(`Creating NFT...`);
      const imageCID = await uploadImage(fileUri);
      const metadataCID = await uploadMetadata(name, description, imageCID);
      const mint = generateSigner(umi);
      const transaction = createNft(umi, {
        mint,
        name,
        uri: ipfsPrefix + metadataCID,
        sellerFeeBasisPoints: percentAmount(0),
      });
      await transaction.sendAndConfirm(umi);
      const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
      setNftOfTheDay(createdNft);
    } catch (error) {
      console.error("Failed to create NFT:", error);
    } finally {
      setIsLoading(false);
    }
  }, [umi, account, isLoading, uploadImage, uploadMetadata]);

  const publicKey = useMemo(() =>
    account?.publicKey ? fromWeb3JsPublicKey(account.publicKey as web3.PublicKey) : null,
    [account]);

  const state: NFTContextState = {
    isLoading,
    publicKey,
    umi,
    nftOfTheDay,
    loadedNFTs,
    connect,
    fetchNFTs,
    createNFT,
  };

  return <NFTContext.Provider value={state}>{children}</NFTContext.Provider>;
}

export const useNFT = (): NFTContextState => useContext(NFTContext);

