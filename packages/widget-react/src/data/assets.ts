import ky from "ky"
import { head } from "ramda"
import { toBytes } from "@noble/hashes/utils"
import { sha256 } from "@noble/hashes/sha2"
import { sha3_256 } from "@noble/hashes/sha3"
import { toHex } from "@cosmjs/encoding"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createQueryKeys } from "@lukemorales/query-key-factory"
import type { Asset, AssetList } from "@initia/initia-registry-types"
import { Address } from "@/public/utils"
import { STALE_TIMES } from "./http"
import type { NormalizedChain } from "./chains"
import { useLayer1 } from "./chains"
import placeholder from "./placeholder"

export const assetQueryKeys = createQueryKeys("initia-widget:asset", {
  list: (assetlistUrl?: string) => [assetlistUrl],
  item: (chainId: string, denom: string) => [chainId, denom],
  denom: (restUrl: string, metadata: string) => [restUrl, metadata],
  metadata: (restUrl: string, denom: string) => [restUrl, denom],
})

function normalizeAsset(asset: Asset) {
  const { base, display, denom_units = [], logo_URIs } = asset
  const denom = base
  const decimals =
    denom_units.find((unit) => unit.denom === display)?.exponent ??
    denom_units.find((unit) => unit.denom === base)?.exponent ??
    head(denom_units)?.exponent ??
    0
  const logoUrl = logo_URIs?.png ?? ""
  return { ...asset, denom, decimals, logoUrl }
}

export type NormalizedAsset = ReturnType<typeof normalizeAsset>

export function useAssets(chain?: NormalizedChain) {
  const assetlistUrl = chain?.metadata?.assetlist
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery({
    queryKey: assetQueryKeys.list(assetlistUrl).queryKey,
    queryFn: async () => {
      if (!assetlistUrl) return { assets: [] as Asset[] }
      return ky.get(assetlistUrl).json<AssetList>()
    },
    select: ({ assets }) => {
      if (!chain) return []
      const normalizedAssets = assets.map(normalizeAsset)
      for (const asset of normalizedAssets) {
        queryClient.setQueryData(assetQueryKeys.item(chain.chainId, asset.denom).queryKey, asset)
      }
      return normalizedAssets
    },
    staleTime: STALE_TIMES.MINUTE,
  })
  return data
}

export function useFindAsset(chain?: NormalizedChain) {
  const assets = useAssets(chain)
  return (denom: string) => {
    const asset = assets.find((asset) => asset.base === denom)
    if (!asset) return { denom, logoUrl: placeholder } as NormalizedAsset
    return asset
  }
}

export function useAsset(denom: string, chain?: NormalizedChain) {
  const findAsset = useFindAsset(chain)
  return findAsset(denom)
}

export function useGetLayer1Denom(chain: NormalizedChain) {
  const layer1 = useLayer1()
  const assets = useAssets(chain)

  return (denom: string) => {
    if (chain.metadata?.is_l1) {
      return denom
    }

    if (denom.startsWith("l2/") || denom.startsWith("ibc/")) {
      const traces = assets.find((asset) => asset.base === denom)?.traces
      if (traces) {
        for (const trace of traces) {
          if (trace.counterparty.chain_name === layer1.chain_name) {
            return trace.counterparty.base_denom
          }
        }
      }
    }

    const ibcChannelToL2 = layer1.metadata?.ibc_channels?.find(
      ({ chain_id, version }) => chain_id === chain.chain_id && version === "ics20-1",
    )?.channel_id

    if (ibcChannelToL2) {
      return getIBCDenom(ibcChannelToL2, denom)
    }

    return ""
  }
}

export function generateDerivedAddress(owner: string, metadata: string) {
  const OBJECT_DERIVED_SCHEME = 0xfc
  const ownerBytes = Address.toBytes(owner, 32)
  const metadataBytes = Address.toBytes(metadata, 32)
  const bytes = new Uint8Array([...ownerBytes, ...metadataBytes, OBJECT_DERIVED_SCHEME])
  return toHex(sha3_256.create().update(bytes).digest())
}

export function generateSeededAddress(creator: string, symbol: string) {
  const OBJECT_FROM_SEED_ADDRESS_SCHEME = 0xfe
  const creatorBytes = Address.toBytes(creator, 32)
  const seed = toBytes(symbol)
  const bytes = new Uint8Array([...creatorBytes, ...seed, OBJECT_FROM_SEED_ADDRESS_SCHEME])
  return toHex(sha3_256.create().update(bytes).digest())
}

export function denomToMetadata(denom: string) {
  if (!denom) return ""
  if (denom.startsWith("move/")) return `0x${denom.slice(5)}`
  return `0x${generateSeededAddress("0x1", denom)}`
}

export function getIBCDenom(channelId: string, denom: string) {
  const path = `transfer/${channelId}/${denom}`
  return `ibc/${toHex(sha256(path)).toUpperCase()}`
}
