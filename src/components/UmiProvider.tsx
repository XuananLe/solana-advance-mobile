import {createContext, ReactNode, useContext} from 'react';
import type {Umi} from '@metaplex-foundation/umi';
import {
  createNoopSigner,
  publicKey,
  signerIdentity,
} from '@metaplex-foundation/umi';
import {createUmi} from '@metaplex-foundation/umi-bundle-defaults';
import {walletAdapterIdentity} from '@metaplex-foundation/umi-signer-wallet-adapters';
import {mplTokenMetadata} from '@metaplex-foundation/mpl-token-metadata';
import {mplCandyMachine} from '@metaplex-foundation/mpl-candy-machine';
import {useAuthorization} from './AuthorizationProvider';

type UmiContext = {
  umi: Umi | null;
};

const DEFAULT_CONTEXT: UmiContext = {
  umi: null,
};

export const UmiContext = createContext<UmiContext>(DEFAULT_CONTEXT);

export const UmiProvider = ({
  endpoint,
  children,
}: {
  endpoint: string;
  children: ReactNode;
}) => {
  const {selectedAccount} = useAuthorization();
  console.log("selectedAccount", JSON.stringify(selectedAccount, null, 2));
  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(mplCandyMachine());
  if (selectedAccount === null) {
    const noopSigner = createNoopSigner(
      publicKey('11111111111111111111111111111111'),
    );
    umi.use(signerIdentity(noopSigner));
  } else {
    umi.use(walletAdapterIdentity(selectedAccount));
  }

  return <UmiContext.Provider value={{umi}}>{children}</UmiContext.Provider>;
};

export function useUmi(): Umi {
  const umi = useContext(UmiContext).umi;
  if (!umi) {
    throw new Error(
      'Umi context was not initialized. ' +
        'Did you forget to wrap your app with <UmiProvider />?',
    );
  }
  return umi;
}
