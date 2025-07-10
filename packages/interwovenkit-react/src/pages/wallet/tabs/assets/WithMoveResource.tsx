import ky from "ky"
import type { ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { STALE_TIMES } from "@/data/http"
import type { NormalizedChain } from "@/data/chains"
import type { NormalizedAsset } from "@/data/assets"
import { assetQueryKeys, denomToMetadata } from "@/data/assets"

interface Props {
  chain: NormalizedChain
  asset: NormalizedAsset
  children: (asset: NormalizedAsset) => ReactNode
}

const WithMoveResource = ({ chain, asset, children }: Props) => {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: assetQueryKeys.resource(chain, asset).queryKey,
    queryFn: async () => {
      if (asset.symbol) return null
      if (!(chain.metadata?.is_l1 || chain.metadata?.minitia?.type === "minimove")) return null
      const metadata = denomToMetadata(asset.denom)
      const { resource } = await ky
        .create({ prefixUrl: chain.restUrl })
        .get(`initia/move/v1/accounts/${metadata}/resources/by_struct_tag`, {
          searchParams: { struct_tag: "0x1::fungible_asset::Metadata" },
        })
        .json<{ resource: { move_resource: string } }>()
      const { data } = JSON.parse(resource.move_resource)
      queryClient.setQueryData(assetQueryKeys.item(chain.chainId, asset.denom).queryKey, {
        ...asset,
        ...data,
      })
      return data
    },
    staleTime: STALE_TIMES.INFINITY,
  })
  return children({ ...asset, ...data })
}

export default WithMoveResource
