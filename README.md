# A demonstration to show how to develop Dapps with Expo

A demonstration showcasing the development of Solana DApps using Expo. We worked on a project called "Mint-A-Day," which allows users to connect their wallet, view their minted NFTs, and create new ones.

## Prerequisites

- Node.js and Yarn
- An Android Emulator if you intend to use a local build
- An Expo EAS account if you are going to use Expo's infrastructure to build

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/solana-developers/mobile-apps-with-expo.git
   cd mobile-apps-with-expo
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Build the project:

   ```bash
    yarn run build  # For building with Expo's infrastructure
    yarn run build:local # For local builds
   ```

4. Run the application:

   ```bash
   yarn run start
   ```

5. In case you encounter this error ```Unable to resolve "@metaplex-foundation/umi/serializers" from "node_modules/@metaplex-foundation/mpl-bubblegum/dist/src/hash.js"```. You can refer to this [Umi issue](https://github.com/metaplex-foundation/umi/issues/94) for more details. To resolve the issue, run the following command

   ```bash
      cd metaplex-fixer
      yarn
      node fixer.mjs
   ```

## Project Structure

- `.expo/`: Contains configuration and metadata for the Expo environment
- `assets/`: Static assets such as images or fonts
- `metaplex-fixer/`: Custom or third-party module for interacting with Metaplex on Solana
- `node_modules/`: Directory for all installed dependencies
- `screenshots/`: Contains screenshot images for documentation or testing purposes
- `src/`: Main source code directory
  - `components/`: Reusable React components
    - `AuthorizationProvider.tsx`: Handles user authentication and wallet connection
    - `ConnectionProvider.tsx`: Manages the connection to the Solana blockchain
    - `NftProvider.tsx`: Logic for fetching and managing NFTs
    - `UmiProvider.tsx`: Integration with Umi for managing token metadata
  - `screens/`: Screens or pages for the app
    - `MainScreen.tsx`: Main user interface where users can view and interact with their NFTs
  - `utils/`: Utility functions and hooks
    - `useMobileWallet.tsx`: A hook for managing mobile wallet connections, containing convenient functions such as ```connect()``` and ```disconnect()```.
    - `polyfills.ts`: Polyfills for supporting older environments
- `app.json`: Expo configuration file
- `App.tsx`: Entry point for the React Native app
- `babel.config.js`: Babel configuration for JavaScript/TypeScript transpiling
- `eas.json`: Expo Application Services (EAS) configuration for building and deploying the app
- `metro.config.js`: Metro bundler configuration for React Native

## Key Features

- Connecting with Wallet
- Fetch NFT Metadata created by you
- Utilize the camera with expo-image-picker to capture a snapshot and mint the NFT to the blockchain.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](https://github.com/solana-foundation/developer-content/blob/main/CONTRIBUTING.md) for more details.
