import {
  View,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Text,
} from "react-native";
import React, { useEffect } from "react";
import { formatDate, useNFT } from "../components/NFTProvider";
import * as ImagePicker from "expo-image-picker";

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
  const {
    fetchNFTs,
    connect,
    publicKey,
    isLoading,
    createNFT,
    loadedNFTs,
    nftOfTheDay,
  } = useNFT();
  const [currentImage, setCurrentImage] =
    React.useState<NFTSnapshot>(PLACEHOLDER);
  const [previousImages, setPreviousImages] =
    React.useState<NFTSnapshot[]>(DEFAULT_IMAGES);
  const todaysDate = new Date(Date.now());

  useEffect(() => {
    if (!loadedNFTs) return;

    const loadedSnapshots = loadedNFTs.map(loadedNft => {
      if (!loadedNft.json) return null;
      if (!loadedNft.json.name) return null;
      if (!loadedNft.json.description) return null;
      if (!loadedNft.json.image) return null;

      const uri = loadedNft.json.image;
      const unixTime = Number(loadedNft.json.description);

      if (!uri) return null;
      if (isNaN(unixTime)) return null;

      return {
        uri: loadedNft.json.image,
        date: new Date(unixTime),
      } as NFTSnapshot;
    });

    // Filter out null values
    const cleanedSnapshots = loadedSnapshots.filter(loadedSnapshot => {
      return loadedSnapshot !== null;
    }) as NFTSnapshot[];

    // Sort by date
    cleanedSnapshots.sort((a, b) => {
      return b.date.getTime() - a.date.getTime();
    });

    setPreviousImages(cleanedSnapshots as NFTSnapshot[]);
  }, [loadedNFTs]);

  useEffect(() => {
    if (!nftOfTheDay) return;

    setCurrentImage({
      uri: nftOfTheDay.json?.image ?? "",
      date: todaysDate,
    });
  }, [nftOfTheDay]);

  const mintNFT = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCurrentImage({
        uri: result.assets[0].uri,
        date: todaysDate,
      });

      createNFT(
        formatDate(todaysDate),
        `${todaysDate.getTime()}`,
        result.assets[0].uri,
      );
    }
  };

  const handleNFTButton = async () => {
    if (!publicKey) {
      connect();
    } else if (loadedNFTs === null) {
      fetchNFTs();
    } else if (!nftOfTheDay) {
      mintNFT();
    } else {
      alert("All done for the day!");
    }
  };

  const renderNFTButton = () => {
    let buttonText = "";
    if (!publicKey) buttonText = "Connect Wallet";
    else if (loadedNFTs === null) buttonText = "Fetch NFTs";
    else if (!nftOfTheDay) buttonText = "Create Snapshot";
    else buttonText = "All Done!";

    if (isLoading) buttonText = "Loading...";

    return <Button title={buttonText} onPress={handleNFTButton} />;
  };

  const renderPreviousSnapshot = (snapshot: NFTSnapshot, index: number) => {
    const date = snapshot.date;
    const formattedDate = formatDate(date);

    return (
      <View key={index}>
        <Image source={snapshot} style={styles.carouselImage} />
        <Text style={styles.carouselText}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Half */}
      <View style={styles.topSection}>
        <Text style={styles.titleText}>Mint-A-Day</Text>
        <Image source={currentImage} style={styles.imageOfDay} />
        {renderNFTButton()}
      </View>

      {/* Bottom Half */}
      <View style={styles.bottomSection}>
        <ScrollView horizontal contentContainerStyle={styles.carousel}>
          {previousImages.map(renderPreviousSnapshot)}
        </ScrollView>
      </View>
    </View>
  );
}
