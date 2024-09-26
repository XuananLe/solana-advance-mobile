// Polyfills
import "./polyfills";
import React from 'react';


import { ConnectionProvider, RPC_ENDPOINT } from "./src/components/ConnectionProvider";
import { MainScreen } from "./src/screens/MainScreen";
import { NFTProvider } from "./src/components/NftProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { AuthorizationProvider } from "./src/components/AuthorizationProvider";
import { UmiProvider } from "./src/components/UmiProvider";

const endpoint = 'https://api.devnet.solana.com';


export default function App() {
  return (
      <ConnectionProvider
        config={{commitment: 'processed'}}
        endpoint={clusterApiUrl(RPC_ENDPOINT)}>
          <AuthorizationProvider>
          <UmiProvider endpoint={endpoint}>
          <NFTProvider>
            <MainScreen></MainScreen>
          </NFTProvider>
          </UmiProvider>
          </AuthorizationProvider>
        </ConnectionProvider>
  );
}
