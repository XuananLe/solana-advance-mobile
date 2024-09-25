// Polyfills
import "./src/polyfills";

import { StyleSheet} from "react-native";

import { ConnectionProvider, RPC_ENDPOINT } from "./src/components/ConnectionProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainScreen } from "./src/screens/MainScreen";
import { NFTProvider } from "./src/components/NftProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { AuthorizationProvider } from "./src/components/AuthorizationProvider";
import { UmiProvider } from "./src/components/UmiProvider";

const queryClient = new QueryClient();
const endpoint = 'https://api.devnet.solana.com';


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
