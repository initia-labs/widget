import ky from "ky"
import type { ReactNode } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { STALE_TIMES } from "@/data/http"
import type { NormalizedChain } from "@/data/chains"
import { assetQueryKeys } from "@/data/assets"

interface Props {
  denom: string
  chain: NormalizedChain
  children: (metadata: string) => ReactNode
}

const WithMetadata = ({ denom, chain, children }: Props) => {
  const { restUrl } = chain

  const { data: metadata } = useSuspenseQuery({
    queryKey: assetQueryKeys.metadata(restUrl, denom).queryKey,
    queryFn: () =>
      ky
        .create({ prefixUrl: restUrl })
        .get("initia/move/v1/metadata", { searchParams: { denom } })
        .json<{ metadata: string }>(),
    select: ({ metadata }) => metadata,
    staleTime: STALE_TIMES.INFINITY,
  })

  return children(metadata)
}

export default WithMetadata
