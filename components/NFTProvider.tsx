import "react-native-url-polyfill/auto";
import { useConnection } from "./ConnectionProvider";
import { Account, useAuthorization } from "./AuthProvider";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { useUmi } from "./MetaplexProvider";
import { publicKey, Umi, PublicKey, generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol";
import "dotenv/config";
import RNFetchBlob from "rn-fetch-blob";
import { createNft, DigitalAsset, fetchAllDigitalAssetByCreator, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { getExplorerLink } from "@solana-developers/helpers";
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
  createNFT: (name: string, description: string, fileUri: string) => { },
};

export function formatDate(date: Date) {
  return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
}

const NFTContext = createContext<NFTContextState>(DEFAULT_NFT_CONTEXT_STATE);

export function NFTProvider(props: NFTProviderProps) {
  const pinata = new PinataSDK({
    pinataJwt: process.env.EXPO_PUBLIC_PINATA_JWT,
    pinataGateway: process.env.EXPO_PUBLIC_PINATA_GATEWAY
  });

  const { children } = props;

  const { connection } = useConnection();
  const { authorizeSession } = useAuthorization();
  const [account, setAccount] = useState<Account | null>(null);
  const [nftOfTheDay, setNftOfTheDay] = useState<DigitalAsset | null>(null);
  const [loadedNFTs, setLoadedNFTs] = useState<DigitalAsset[] | null>(null);
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

  const fetchNFTs = async () => {
    if (!umi || !account || isLoading) return;
    setIsLoading(true);
    try {
      const nfts = await fetchAllDigitalAssetByCreator(umi, publicKey(account.publicKey))

      const loadedNFTs = await Promise.all(
        nfts.map(async (nft) => {
          // If you need to load the metadata separately, fetch it here.
          // For now, we assume nft.metadata is already available.
          const metadata = nft.metadata || {}; // Handle cases where metadata might not be available.
          return { nft, metadata };
        })
      );

      setLoadedNFTs(loadedNFTs.map((loadedNft) => loadedNft.nft));
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }

  const uploadImage = async (fileUri: string): Promise<string> => {
    const imageBytesInBase64: string = await RNFetchBlob.fs.readFile(
      fileUri,
      "base64",
    );

    // pinata.upload.base64 is used to send the Base64-encoded image to Pinata Cloud
    // This is based on Pinata's Base64 upload API: https://docs.pinata.cloud/web3/sdk/upload/base64#base64
    const upload = await pinata.upload.base64(imageBytesInBase64);

    // Return the IPFS hash of the uploaded image (IPFS is a decentralized file storage system)
    return upload.IpfsHash;
  };

  const uploadMetadata = async (
    name: string,
    description: string,
    imageCID: string,
  ): Promise<string> => {
    // pinata.upload.json is used to send the JSON to Pinata Cloud
    // This is based on Pinata's Base64 upload API: https://docs.pinata.cloud/web3/sdk/upload/json
    const upload = await pinata.upload.json({
      name: name,
      description: description,
      imageCID: imageCID
    })
    return upload.IpfsHash
  }

  const createNFT = async (
    name: string,
    description: string,
    fileUri: string,
  ) => {
    if (!umi || !account || !isLoading) return;

    setIsLoading(true);

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

    try {
      const mint = generateSigner(umi);
      const transaction = createNft(umi, {
        mint,
        name: name,
        uri: fileUri,
        sellerFeeBasisPoints: percentAmount(0),
      });
      await transaction.sendAndConfirm(umi);
      const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

      console.log(
        `✨🖼️ Created NFT! Address is: ${getExplorerLink(
          "address",
          createdNft.mint.publicKey,
          "devnet"
        )}`
      );
      console.log("✅ Finished successfully!");
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };
  const state = {
    isLoading,
    account,
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

