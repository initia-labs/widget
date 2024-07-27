import ky from "ky"
import { useQuery, useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createQueryKeys } from "@lukemorales/query-key-factory"
import { useInitiaAddress } from "@/public/data/hooks"
import { STALE_TIMES } from "@/data/http"
import type { Paginated } from "@/data/pagination"
import { fetchAllPages, getNextPageParam } from "@/data/pagination"
import type { NormalizedChain } from "@/data/chains"

const nftQueryKeys = createQueryKeys("initia-widget:nft", {
  collections: (indexerUrl: string, address: string) => [indexerUrl, address],
  collection: (indexerUrl: string, address: string, collectionAddress: string) => [
    indexerUrl,
    address,
    collectionAddress,
  ],
  metadata: (url?: string) => [url],
})

export interface CollectionResponse {
  object_addr: string
  collection: {
    name: string
    description: string
    uri: string
    creator_addr: string
  }
}

function normalizeCollection(collectionResponse: CollectionResponse) {
  const { object_addr, collection } = collectionResponse
  return { object_addr, ...collection }
}

export type NormalizedCollection = ReturnType<typeof normalizeCollection>

export interface NftResponse {
  collection_addr: string
  collection_name: string
  nft: { token_id: string; uri: string; description: string }
  object_addr: string
}

export interface NftMetadata {
  name?: string
  image?: string
  description?: string
  attributes?: { trait_type: string; value: string }[]
}

export function normalizeNft(nftResponse: NftResponse, nftMetadata: NftMetadata) {
  const { collection_addr, collection_name, nft, object_addr } = nftResponse
  const name = nftMetadata.name ?? nft.token_id
  return { collection_addr, collection_name, ...nft, object_addr, ...nftMetadata, name }
}

export type NormalizedNft = ReturnType<typeof normalizeNft>

export function useCollections(chain: NormalizedChain) {
  const { indexerUrl } = chain
  const address = useInitiaAddress()
  const { data } = useSuspenseQuery({
    queryKey: nftQueryKeys.collections(indexerUrl, address).queryKey,
    queryFn: () =>
      fetchAllPages<"collections", CollectionResponse>(
        `indexer/nft/v1/collections/by_account/${address}`,
        { prefixUrl: indexerUrl },
        "collections",
      ),
    select: (collections) => collections.map(normalizeCollection),
    staleTime: STALE_TIMES.SECOND,
  })
  return data
}

export function useNfts({
  chain,
  collection,
}: {
  chain: NormalizedChain
  collection: NormalizedCollection
}) {
  const address = useInitiaAddress()
  const { object_addr: collectionAddress } = collection
  const { indexerUrl } = chain
  return useSuspenseInfiniteQuery({
    queryKey: nftQueryKeys.collection(indexerUrl, address, collectionAddress).queryKey,
    queryFn: ({ pageParam: key = "" }) =>
      ky
        .create({ prefixUrl: indexerUrl })
        .get(`indexer/nft/v1/tokens/by_account/${address}`, {
          searchParams: {
            collection_addr: collectionAddress,
            "pagination.key": key || "",
            "pagination.limit": 9,
          },
        })
        .json<Paginated<"tokens", NftResponse>>(),
    initialPageParam: "",
    getNextPageParam: getNextPageParam,
    staleTime: STALE_TIMES.SECOND,
  })
}

function convertIPFS(url?: string) {
  return url?.replace("ipfs://", "https://ipfs.io/ipfs/")
}

export function useNftMetataQuery(url?: string) {
  const queryUrl = convertIPFS(url)
  return useQuery({
    queryKey: nftQueryKeys.metadata(queryUrl).queryKey,
    queryFn: async (): Promise<NftMetadata> => {
      try {
        if (!queryUrl) return {}
        const metadata = await ky.get(queryUrl).json<NftMetadata>()
        return { ...metadata, image: convertIPFS(metadata.image) }
      } catch {
        return {}
      }
    },
    staleTime: STALE_TIMES.INFINITY,
  })
}

export interface ChainCollectionNftCollectionState {
  collection: NormalizedCollection
  nft: NormalizedNft
  chain: NormalizedChain
}
