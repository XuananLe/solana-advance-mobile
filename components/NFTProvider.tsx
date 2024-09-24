// import "react-native-url-polyfill/auto";
// import { DigitalAsset, createNft, fetchAllDigitalAssetByCreator, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
// import { PublicKey, Umi, generateSigner, percentAmount, publicKey } from "@metaplex-foundation/umi";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
// import { clusterApiUrl, PublicKey as solanaPublicKey } from "@solana/web3.js";
// import { PinataSDK } from "pinata-web3";
// import React, { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";
// import RNFetchBlob from "rn-fetch-blob";
// import { Account, useAuthorization } from "../utils/useAuthorization";
// import { useConnection } from "./ConnectionProvider";
// import { useUmi } from "./MetaplexProvider";
// import { useMobileWallet } from "../utils/useMobileWallet";

// export interface NFTProviderProps {
//   children: ReactNode;
// }

// export interface NFTContextState {
//   umi: Umi | null; // Holds the Umi object that we use to call `fetch` and `create` on.
//   publicKey: PublicKey | null; // The public key of the authorized wallet
//   isLoading: boolean; // Loading state
//   loadedNFTs: (DigitalAsset)[] | null; // Array of loaded NFTs that contain metadata
//   nftOfTheDay: (DigitalAsset) | null; // The NFT snapshot created on the current day
//   connect: () => void; // Connects (and authorizes) us to the Devnet-enabled wallet
//   fetchNFTs: () => void; // Fetches the NFTs using the `metaplex` object
//   createNFT: (name: string, description: string, fileUri: string) => void; // Creates the NFT
// }



// export function formatDate(date: Date) {
//   return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
// }

// const NFTContext = createContext<NFTContextState | null>(null);

// export function NFTProvider(props: NFTProviderProps) {
//   const ipfsPrefix = `https://${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/`;
//   const pinata = useMemo(() => new PinataSDK({
//     pinataJwt: process.env.EXPO_PUBLIC_PINATA_JWT,
//     pinataGateway: process.env.EXPO_PUBLIC_PINATA_GATEWAY,
//   }), []);
//   const { connection } = useConnection();
//   const { authorizeSessionWithSignIn, authorizeSession, deauthorizeSession } = useAuthorization();
//   const [account, setAccount] = useState<Account | null>(null);
//   const [nftOfTheDay, setNftOfTheDay] = useState<DigitalAsset | null>(null);
//   const [loadedNFTs, setLoadedNFTs] = useState<DigitalAsset[] | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const { umi } = useUmi(connection, account, authorizeSession);
//   const { children } = props;

//   const {connect} = useMobileWallet();

//   const fetchNFTs = useCallback(async () => {
//     if (!umi || !account || isLoading) return;
//     setIsLoading(true);

//     try {
//       const creatorPublicKey = fromWeb3JsPublicKey(account.publicKey);
//       const nfts = await fetchAllDigitalAssetByCreator(umi, creatorPublicKey);
//       setLoadedNFTs(nfts);
//     } catch (error) {
//       console.error("Failed to fetch NFTs:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [umi, account, isLoading]);
//   const uploadImage = useCallback(async (fileUri: string): Promise<string> => {
//     const imageBytesInBase64 = await RNFetchBlob.fs.readFile(fileUri, "base64");
//     const upload = await pinata.upload.base64(imageBytesInBase64);
//     return upload.IpfsHash;
//   }, [pinata]);


//   const uploadMetadata = useCallback(async (
//     name: string,
//     description: string,
//     imageCID: string,
//   ): Promise<string> => {
//     const upload = await pinata.upload.json({ name, description, imageCID });
//     return upload.IpfsHash;
//   }, [pinata]);


//   const createNFT = useCallback(async (
//     name: string,
//     description: string,
//     fileUri: string,
//   ) => {
//     if (!umi || !account || isLoading) return;
//     setIsLoading(true);
//     try {
//       console.log(`Creating NFT...`);
//       const imageCID = await uploadImage(fileUri);
//       const metadataCID = await uploadMetadata(name, description, imageCID);
//       const mint = generateSigner(umi);
//       const transaction = createNft(umi, {
//         mint,
//         name,
//         uri: ipfsPrefix + metadataCID,
//         sellerFeeBasisPoints: percentAmount(0),
//       });
//       await transaction.sendAndConfirm(umi);
//       const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
//       setNftOfTheDay(createdNft);
//     } catch (error) {
//       console.error("Failed to create NFT:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [umi, account, isLoading, uploadImage, uploadMetadata]);

//   const publicKey = useMemo(() =>
//     account?.publicKey ? fromWeb3JsPublicKey(account.publicKey as solanaPublicKey) : null,
//     [account]);

//   const state: NFTContextState = {
//     isLoading,
//     publicKey,
//     umi,
//     nftOfTheDay,
//     loadedNFTs,
//     connect,
//     fetchNFTs,
//     createNFT,
//   };

//   return <NFTContext.Provider value={state}>{children}</NFTContext.Provider>;
// }

// export const useNFT = (): NFTContextState => {
//   const context = useContext(NFTContext);
//   if (!context) {
//     throw new Error("useNFT must be used within an NFTProvider");
//   }
//   return context;
// };
