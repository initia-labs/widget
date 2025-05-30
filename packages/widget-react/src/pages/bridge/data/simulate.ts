import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { OperationJson, RouteResponseJson } from "@skip-go/client"
import { toAmount } from "@/public/utils"
import { normalizeError, STALE_TIMES } from "@/data/http"
import { useInitiaRegistry, useLayer1 } from "@/data/chains"
import { skipQueryKeys, useSkip } from "./skip"
import { useBridgeForm } from "./form"
import { useChainType, useSkipChain } from "./chains"
import type { RouterAsset } from "./assets"
import { useSkipAsset } from "./assets"

interface BaseOperationJson {
  tx_index: number
  amount_in: string
  amount_out: string
}

interface LzTransferJson {
  denom_in: string
  denom_out: string
  from_chain_id: string
  to_chain_id: string
}

export type RouterOperationJson =
  | OperationJson
  | (BaseOperationJson & { lz_transfer: LzTransferJson })

export interface RouterRouteResponseJson extends RouteResponseJson {
  operations: RouterOperationJson[]
  required_op_hook?: boolean
}

export function useRouteQuery(
  debouncedQuantity: string,
  opWithdrawal?: { isOpWithdraw?: boolean; disabled?: boolean },
) {
  const { watch } = useBridgeForm()
  const values = watch()
  const skip = useSkip()

  const debouncedValues = { ...values, quantity: debouncedQuantity }

  const queryClient = useQueryClient()
  return useQuery({
    queryKey: skipQueryKeys.route(debouncedValues, opWithdrawal?.isOpWithdraw).queryKey,
    queryFn: async () => {
      try {
        const { srcChainId, srcDenom, quantity, dstChainId, dstDenom } = debouncedValues

        const { decimals: srcDecimals } = queryClient.getQueryData<RouterAsset>(
          skipQueryKeys.asset(srcChainId, srcDenom).queryKey,
        ) ?? { decimals: 0 }

        const params = {
          amount_in: toAmount(quantity, srcDecimals),
          source_asset_chain_id: srcChainId,
          source_asset_denom: srcDenom,
          dest_asset_chain_id: dstChainId,
          dest_asset_denom: dstDenom,
          allow_unsafe: true,
          go_fast: true,
          is_op_withdraw: opWithdrawal?.isOpWithdraw,
        }

        return await skip
          .post("v2/fungible/route", { json: params })
          .json<RouterRouteResponseJson>()
      } catch (error) {
        throw new Error(await normalizeError(error))
      }
    },
    enabled: !!Number(debouncedValues.quantity) && !opWithdrawal?.disabled,
    staleTime: STALE_TIMES.MINUTE,
  })
}

export function useIsOpWithdrawable() {
  const { watch } = useBridgeForm()
  const { srcChainId, srcDenom, dstChainId, dstDenom } = watch()
  const srcChain = useSkipChain(srcChainId)
  const srcChainType = useChainType(srcChain)
  const srcAsset = useSkipAsset(srcDenom, srcChainId)
  const dstAsset = useSkipAsset(dstDenom, dstChainId)

  const layer1 = useLayer1()
  const chains = useInitiaRegistry()
  return (
    srcChainType === "initia" &&
    dstChainId === layer1.chainId &&
    srcAsset.symbol === dstAsset.symbol &&
    chains
      .find((chain) => chain.chainId === srcChainId)
      ?.metadata?.op_denoms?.includes(dstAsset.denom)
  )
}
