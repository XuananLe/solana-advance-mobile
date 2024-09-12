import { PublicKey } from '@metaplex-foundation/umi';
import {
  Metadata,
  TokenStandard,
  CollectionDetails,
  UseMethod,
  Creator,
  Collection,
  Uses,
} from '@metaplex-foundation/mpl-token-metadata';
import { Mint } from '@metaplex-foundation/mpl-toolbox';

type NftEdition = {
  isOriginal: boolean;
  largestMintedEdition?: bigint;
  printEditionMint?: PublicKey;
  printEditionNum?: bigint;
};

export type Nft = Omit<Metadata, 'model' | 'address' | 'mintAddress'> & {
  /** A model identifier to distinguish models in the SDK. */
  readonly model: 'nft';

  /** The mint address of the NFT. */
  readonly address: PublicKey;

  /** The metadata address of the NFT. */
  readonly metadataAddress: PublicKey;

  /** The mint account of the NFT. */
  readonly mint: Mint;

  /** 
   * Defines whether the NFT is an original edition or a
   * printed edition and provides additional information accordingly.
   */
  readonly edition: NftEdition;

  /** The update authority of the NFT. */
  readonly updateAuthority: PublicKey;

  /** The JSON URI of the NFT. */
  readonly uri: string;

  /** The name of the NFT. */
  readonly name: string;

  /** The symbol of the NFT. */
  readonly symbol: string;

  /** The token standard of the NFT. */
  readonly tokenStandard: TokenStandard;

  /** The collection details of the NFT, if any. */
  readonly collectionDetails: CollectionDetails | null;

  /** The use method of the NFT, if any. */
  readonly useMethod: UseMethod | null;

  /** The creators of the NFT. */
  readonly creators: Creator[];

  /** The collection the NFT belongs to, if any. */
  readonly collection: Collection | null;

  /** The uses of the NFT, if any. */
  readonly uses: Uses | null;

  /** Whether the NFT is mutable. */
  readonly isMutable: boolean;
};