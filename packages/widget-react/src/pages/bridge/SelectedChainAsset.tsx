import { truncate } from "@/public/utils"
import ModalTrigger from "@/components/ModalTrigger"
import AssetOnChainButton from "@/components/form/AssetOnChainButton"
import { useBridgeForm } from "./data/form"
import { useSkipChain } from "./data/chains"
import { useSkipAsset } from "./data/assets"
import SelectChainAsset from "./SelectChainAsset"

const SelectedChainAsset = ({ type }: { type: "src" | "dst" }) => {
  const chainIdKey = type === "src" ? "srcChainId" : "dstChainId"
  const denomKey = type === "src" ? "srcDenom" : "dstDenom"
  const title =
    type === "src" ? "Select source chain and asset" : "Select destination chain and asset"

  const { watch } = useBridgeForm()
  const chainId = watch(chainIdKey)
  const denom = watch(denomKey)

  const chain = useSkipChain(chainId)
  const asset = useSkipAsset(denom, chainId)

  return (
    <ModalTrigger
      title={title}
      content={({ onClose }) => <SelectChainAsset type={type} afterSelect={onClose} />}
    >
      {({ onOpen }) => (
        <AssetOnChainButton
          asset={{
            denom: asset.denom,
            decimals: asset.decimals ?? 0,
            symbol: asset.symbol ?? truncate(asset.denom),
            logoUrl: asset.logo_uri ?? "",
          }}
          chain={{
            chainId: chain.chain_id,
            name: chain.pretty_name || chain.chain_name,
            logoUrl: chain.logo_uri ?? "",
          }}
          onClick={onOpen}
        />
      )}
    </ModalTrigger>
  )
}

export default SelectedChainAsset
