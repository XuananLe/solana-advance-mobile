import { ConnectionProvider } from "./components/ConnectionProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { MainScreen } from "./screens/MainScreen"
import "./polyfills"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClusterProvider } from "./components/ClusterProvider";


const queryClient = new QueryClient();

export default function App() {
  const cluster = "devnet";
  const endpoint = clusterApiUrl(cluster);

  return (
    <QueryClientProvider client={queryClient}>
      <ClusterProvider>
      <ConnectionProvider
        config={{ commitment: "processed" }}
      >
            <MainScreen />
      </ConnectionProvider>
      </ClusterProvider>
    </QueryClientProvider>

  );
}