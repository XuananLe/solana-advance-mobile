import { ConnectionProvider } from "./components/ConnectionProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { MainScreen } from "./screens/MainScreen"
import "./polyfills"
import { NFTProvider } from "./components/NFTProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  const cluster = "devnet";
  const endpoint = clusterApiUrl(cluster);

  return (
    <QueryClientProvider client={queryClient}>

      <ConnectionProvider
        endpoint={endpoint}
        cluster={cluster}
        config={{ commitment: "processed" }}
      >
          <NFTProvider>
            <MainScreen />
          </NFTProvider>
      </ConnectionProvider>
    </QueryClientProvider>

  );
}