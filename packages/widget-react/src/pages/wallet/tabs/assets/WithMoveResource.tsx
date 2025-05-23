import ky from "ky"
import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import type { NormalizedChain } from "@/data/chains"
import type { NormalizedAsset } from "@/data/assets"
import { denomToMetadata } from "@/data/assets"
import type { BaseAsset } from "@/components/form/types"

interface Props {
  chain: NormalizedChain
  asset: BaseAsset
  children: (asset: NormalizedAsset) => ReactNode
}

const WithMoveResource = ({ chain, asset, children }: Props) => {
  const { restUrl } = chain
  const { data } = useQuery({
    queryKey: [restUrl, chain, asset],
    queryFn: async () => {
      if (asset.symbol) return null
      if (!(chain.metadata?.is_l1 || chain.metadata?.minitia?.type === "minimove")) return null
      const metadata = denomToMetadata(asset.denom)
      const { resource } = await ky
        .create({ prefixUrl: restUrl })
        .get(`initia/move/v1/accounts/${metadata}/resources/by_struct_tag`, {
          searchParams: { struct_tag: "0x1::fungible_asset::Metadata" },
        })
        .json<{ resource: { move_resource: string } }>()
      const { data } = JSON.parse(resource.move_resource)
      return data
    },
  })
  return children({ ...data, ...asset })
}

export default WithMoveResource
