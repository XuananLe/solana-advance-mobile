import "react-native-url-polyfill/auto";
import { DigitalAsset, createNft, fetchAllDigitalAssetByCreator, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, Umi, generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { clusterApiUrl, PublicKey as solanaPublicKey } from "@solana/web3.js";
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUmi } from "./UmiProvider";
import { useMobileWallet } from "../utils/useMobileWallet";
import { Account, useAuthorization } from "./AuthorizationProvider";
import { Platform } from "react-native";

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
  const [account, setAccount] = useState<Account | null>(null);
  const [nftOfTheDay, setNftOfTheDay] = useState<DigitalAsset | null>(null);
  const [loadedNFTs, setLoadedNFTs] = useState<DigitalAsset[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const umi = useUmi();
  const { children } = props;
  const { connect } = useMobileWallet();
  
  async function uploadImageFromURI(fileUri: string) {
    try {
      console.log("fileURI", fileUri)
      const form = new FormData();
      const randomFileName = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;

      // @ts-ignore
      form.append("file", {
        uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
        type: 'image/jpeg', // Adjust the type as necessary
        name: randomFileName // Adjust the name as necessary
      });
  
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`, // Use the actual API key instead of the URL
          'Content-Type': 'multipart/form-data'
        },
        body: form
      };
  
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', options);
      const responseJson = await response.json();
      console.log(responseJson.IpfsHash)

      return responseJson; 
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      console.log("Upload process completed.");
    }
  }
  

  async function uploadMetadataJson(
    name = "Pinnie",
    description = "A really sweet NFT of Pinnie the Pinata",
    imageCID = "bafkreih5aznjvttude6c3wbvqeebb6rlx5wkbzyppv7garjiubll2ceym4"
  ) {
    const randomFileName = `metadata_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`;
    const data = JSON.stringify({
      pinataContent: {
        name,
        description,
        imageCID,
      },
      pinataMetadata: {
        name: randomFileName
      }
    });
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`   
      },
      body: data,
    });
    const resData = await res.json();
    
    return resData;
  }
  
  // Connect wallet and set account
  async function handleConnect() {
    try {
      const walletAccount = await connect();
      if (walletAccount) {
        setAccount(walletAccount); // Update account state with the connected wallet
        console.log('Connected account:', walletAccount);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }
  useEffect(() => {
    handleConnect(); // Auto-connect when the component mounts (optional)
  }, []);

  const fetchNFTs = useCallback(async () => {
    if (!umi || !account || isLoading) return;
    setIsLoading(true);
    try {
      const creatorPublicKey = fromWeb3JsPublicKey(account.publicKey);
      console.log("Creator", creatorPublicKey)
      const nfts = await fetchAllDigitalAssetByCreator(umi, creatorPublicKey);
      setLoadedNFTs(nfts);
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [umi, account, isLoading]);

  const uploadImage = useCallback(async (fileUri: string): Promise<string> => {
    const upload = await uploadImageFromURI(fileUri)
    return upload.IpfsHash;
  }, []);


  const uploadMetadata = useCallback(async (
    name: string,
    description: string,
    imageCID: string,
  ): Promise<string> => {
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
      console.log(metadataCID);
      const mint = generateSigner(umi);
      const transaction = createNft(umi, {
        mint,
        name,
        uri: ipfsPrefix + metadataCID,
        sellerFeeBasisPoints: percentAmount(0),
      });
      
      await transaction.sendAndConfirm(umi);
      console.log("Hello 999 anh em");
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
