// import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  View,
} from "react-native";
import { useAuthorization } from "../utils/useAuthorization";
import { useMobileWallet } from "../utils/useMobileWallet";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292524",
  },
  titleText: {
    color: "white",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    paddingTop: 30,
  },
  imageOfDay: {
    width: "80%",
    height: "80%",
    resizeMode: "cover",
    margin: 10,
  },
  bottomSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carousel: {
    justifyContent: "center",
    alignItems: "center",
  },
  carouselText: {
    textAlign: "center",
    color: "white",
  },
  carouselImage: {
    width: 100,
    height: 100,
    margin: 5,
    resizeMode: "cover",
  },
});

export interface NFTSnapshot {
  uri: string;
  date: Date;
}

// Placeholder image URL or local source
const PLACEHOLDER: NFTSnapshot = {
  uri: "https://placehold.co/400x400/png",
  date: new Date(Date.now()),
};
const DEFAULT_IMAGES: NFTSnapshot[] = new Array(7).fill(PLACEHOLDER);

export function MainScreen() {
  // const {
  //   fetchNFTs,
  //   connect,
  //   publicKey,
  //   isLoading,
  //   createNFT,
  //   loadedNFTs,
  //   nftOfTheDay,
  // } = useNFT();
  // const [currentImage, setCurrentImage] =
  //   React.useState<NFTSnapshot>(PLACEHOLDER);
  // const [previousImages, setPreviousImages] =
  //   React.useState<NFTSnapshot[]>(DEFAULT_IMAGES);
  // const todaysDate = new Date(Date.now());
  // const ipfsPrefix = `https://${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/`
  // type NftMetaResponse = {
  //   name: string,
  //   description: string,
  //   imageCID: string
  // }
  // const fetchMetadata = async (uri: string) => {
  //   try {
  //     const response = await fetch(uri);
  //     const metadata = (await response.json());
  //     return metadata as NftMetaResponse;
  //   } catch (error) {
  //     console.error("Error fetching metadata:", error);
  //     return null;
  //   }
  // };

  // useEffect(() => {
  //   if (!loadedNFTs) return;

  //   const loadSnapshots = async () => {
  //     const loadedSnapshots = await Promise.all(loadedNFTs.map(async (loadedNft) => {
  //       if (!loadedNft.metadata.name) return null;
  //       if (!loadedNft.metadata.uri) return null;

  //       const metadata = await fetchMetadata(loadedNft.metadata.uri);
  //       if (!metadata) return null;

  //       const { imageCID, description } = metadata;
  //       if (!imageCID || !description) return null;

  //       const unixTime = Number(description);
  //       if (isNaN(unixTime)) return null;

  //       return {
  //         uri: ipfsPrefix + imageCID,
  //         date: new Date(unixTime),
  //       } as NFTSnapshot;
  //     }));

  //     // Filter out null values
  //     const cleanedSnapshots = loadedSnapshots.filter(
  //       (snapshot): snapshot is NFTSnapshot => snapshot !== null
  //     );

  //     // Sort by date
  //     cleanedSnapshots.sort((a, b) => b.date.getTime() - a.date.getTime());

  //     setPreviousImages(cleanedSnapshots);
  //   };

  //   loadSnapshots();
  // }, [loadedNFTs]);


  // useEffect(() => {
  //   if (!nftOfTheDay) return;

  //   const fetchNftOfTheDayMetadata = async () => {
  //     try {
  //       if (!nftOfTheDay.metadata.uri) {
  //         console.error("No metadata URI found for nftOfTheDay");
  //         return;
  //       }

  //       const response = await fetchMetadata(nftOfTheDay.metadata.uri);

  //       if (!response?.imageCID) {
  //         console.error("No image found in nftOfTheDay metadata");
  //         return;
  //       }

  //       setCurrentImage({
  //         uri: ipfsPrefix + response.imageCID,
  //         date: todaysDate,
  //       });
  //     } catch (error) {
  //       console.error("Error fetching nftOfTheDay metadata:", error);
  //     }
  //   };

  //   fetchNftOfTheDayMetadata();
  // }, [nftOfTheDay, todaysDate]);
  // const mintNFT = async () => {
  //   const result = await ImagePicker.launchCameraAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setCurrentImage({
  //       uri: result.assets[0].uri,
  //       date: todaysDate,
  //     });

  //     createNFT(
  //       formatDate(todaysDate),
  //       `${todaysDate.getTime()}`,
  //       result.assets[0].uri,
  //     );
  //   }
  // };
  // const handleNFTButton = async () => {
  //   if (!publicKey) {
  //     await connect();
  //   } else if (loadedNFTs === null) {
  //     fetchNFTs();
  //   } else if (!nftOfTheDay) {
  //     mintNFT();
  //   } else {
  //     alert("All done for the day!");
  //   }
  // };

  // const renderNFTButton = () => {
  //   let buttonText = "";
  //   if (!publicKey) buttonText = "Connect Wallet";
  //   else if (loadedNFTs === null) buttonText = "Fetch NFTs";
  //   else if (!nftOfTheDay) buttonText = "Create Snapshot";
  //   else buttonText = "All Done!";

  //   if (isLoading) buttonText = "Loading...";

  //   
  // return (
  //   <Button mode="contained" onPress={handleNFTButton}>
  //     {buttonText}
  //   </Button>
  // );
  // };

  // const renderPreviousSnapshot = (snapshot: NFTSnapshot, index: number) => {
  //   const date = snapshot.date;
  //   const formattedDate = formatDate(date);

  //   return (
  //     <View key={index}>
  //       <Image source={snapshot} style={styles.carouselImage} />
  //       <Text style={styles.carouselText}>{formattedDate}</Text>
  //     </View>
  //   );
  // };

  function ConnectButton() {
    const { authorizeSession } = useAuthorization();
    const { connect } = useMobileWallet();
    const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
    const handleConnectPress = useCallback(async () => {
      try {
        if (authorizationInProgress) {
          return;
        }
        setAuthorizationInProgress(true);
        await connect();
      } catch (err: any) {
          console.error("Loi o day ", err)
      } finally {
        setAuthorizationInProgress(false);
      }
    }, [authorizationInProgress, authorizeSession]);
    return (
      <Button
      onPress={handleConnectPress}
      title="Connect"
      color="#841584"
      accessibilityLabel="Learn more about this purple button"
      />
    );
  }
  
  return (
    <>
      <View>
        <ConnectButton />
      </View>
    </>
  );
}
