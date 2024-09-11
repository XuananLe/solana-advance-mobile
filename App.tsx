import { ConnectionProvider } from "./components/ConnectionProvider";
import { AuthorizationProvider } from "./components/AuthProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { MainScreen } from "./screens/MainScreen"
import "./polyfills"
import { NFTProvider } from "./components/NFTProvider";

export default function App() {
  const cluster = "devnet";
  const endpoint = clusterApiUrl(cluster);

  return (
    <ConnectionProvider
      endpoint={endpoint}
      cluster={cluster}
      config={{ commitment: "processed" }}
    >
      <AuthorizationProvider cluster={cluster}>
        <NFTProvider>
          <MainScreen />
        </NFTProvider>
      </AuthorizationProvider>
    </ConnectionProvider>
  );
}