import "react-native-url-polyfill/auto";
import { DigitalAsset, createNft, fetchAllDigitalAssetByCreator, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, Umi, generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { clusterApiUrl, PublicKey as solanaPublicKey } from "@solana/web3.js";
import React, { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";
import RNFetchBlob from "rn-fetch-blob";
import { useConnection } from "./ConnectionProvider";
import { useUmi } from "./UmiProvider";
import { useMobileWallet } from "../utils/useMobileWallet";
import { Account, useAuthorization } from "./AuthorizationProvider";

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



export function formatDate(date: Date) {
  return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
}

const NFTContext = createContext<NFTContextState | null>(null);

export function NFTProvider(props: NFTProviderProps) {
  const ipfsPrefix = `https://${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/`;
  const { connection } = useConnection();
  const { authorizeSession, deauthorizeSession } = useAuthorization();
  const [account, setAccount] = useState<Account | null>(null);
  const [nftOfTheDay, setNftOfTheDay] = useState<DigitalAsset | null>(null);
  const [loadedNFTs, setLoadedNFTs] = useState<DigitalAsset[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const umi = useUmi();
  const { children } = props;

  const { connect } = useMobileWallet();
  async function uploadBase64(base64String: string) {
    try {
      const buffer = Buffer.from(base64String, "base64");
      const blob = new Blob([buffer]);
      const file = new File([blob], "file");
      const data = new FormData();
      data.append("file", file);

      const upload = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`,
          },
          body: data,
        },
      );
      const uploadRes = await upload.json();
      return uploadRes;
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadMetadataJson(
    name: string,
    description: string,
    imageCID: string
  ) {
    const data = JSON.stringify({
      pinataContent: {
        name,
        description,
        imageCID,
      },
    });

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`,
      },
      body: data,
    });

    const resData = await res.json();
    return resData;
  }



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
    const upload = await uploadBase64(imageBytesInBase64)
    return upload.IpfsHash;
  }, []);


  const uploadMetadata = useCallback(async (
    name: string,
    description: string,
    imageCID: string,
  ): Promise<string> => {
    const data = JSON.stringify({
      pinataContent: {
        name,
        description,
        imageCID,
      },
    })
    const uploadRes = await uploadMetadataJson(name, description, imageCID);
    return uploadRes.IpfsHash;
  }, []);


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
    account?.publicKey ? fromWeb3JsPublicKey(account.publicKey as solanaPublicKey) : null,
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

export const useNFT = (): NFTContextState => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error("useNFT must be used within an NFTProvider");
  }
  return context;
};
