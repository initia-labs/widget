import type { ReactNode } from "react"
import type { NftResponse, NormalizedNft } from "./queries"
import { normalizeNft, useNftMetataQuery } from "./queries"

interface Props {
  nftResponse: NftResponse
  children: (nft: NormalizedNft) => ReactNode
}

const WithNormalizedNft = ({ nftResponse, children }: Props) => {
  const { data: metadata = {} } = useNftMetataQuery(nftResponse.nft.uri)
  const nft = normalizeNft(nftResponse, metadata)
  return children(nft)
}

export default WithNormalizedNft
