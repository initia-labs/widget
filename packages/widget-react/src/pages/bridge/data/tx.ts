import { has, path } from "ramda"
import { AuthInfo, Tx, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import { toBase64 } from "@cosmjs/encoding"
import { useLocalStorage } from "react-use"
import { useMutation, useQuery } from "@tanstack/react-query"
import type {
  RouteResponseJson,
  StatusResponseJson,
  TrackResponseJson,
  TxJson,
} from "@skip-go/client"
import { aminoConverters, aminoTypes } from "@initia/amino-converter"
import { useLocationState } from "@/lib/router"
import { useInitiaAddress } from "@/public/data/hooks"
import { LocalStorageKey } from "@/data/constants"
import { normalizeError, STALE_TIMES } from "@/data/http"
import { useSignWithEthSecp256k1 } from "@/data/signer"
import { skipQueryKeys, useSkip } from "./skip"
import type { FormValues } from "./form"
import { waitForAccountCreation } from "./account"
import { useFindSkipChain } from "./chains"
import type { RouterRouteResponseJson } from "./simulate"

export interface BridgePreviewState {
  route: RouterRouteResponseJson
  values: FormValues
  tx?: TxJson
  txHash?: string
}

export interface SignedOpHook {
  signer: string
  hook: string
}

interface OpHookResponse {
  chain_id: string
  hook: {
    msg_type_url: string
    msg: string
  }[]
}

export function useBridgePreviewState() {
  return useLocationState<BridgePreviewState>()
}

export function useSignOpHook() {
  const skip = useSkip()
  const initiaAddress = useInitiaAddress()
  const signWithEthSecp256k1 = useSignWithEthSecp256k1()
  const { route, values } = useBridgePreviewState()
  const findSkipChain = useFindSkipChain()

  return useMutation({
    mutationFn: async () => {
      const { chain_id, hook } = await skip
        .post("op-hook", {
          json: {
            source_address: initiaAddress,
            source_asset_chain_id: route.source_asset_chain_id,
            source_asset_denom: route.source_asset_denom,
            dest_address: values.recipient,
            dest_asset_chain_id: route.dest_asset_chain_id,
            dest_asset_denom: route.dest_asset_denom,
          },
        })
        .json<OpHookResponse>()

      await waitForAccountCreation(initiaAddress, findSkipChain(route.dest_asset_chain_id).rest)

      const messages = hook.map(({ msg_type_url, msg }) => {
        // Note: `typeUrl` comes in proto format, but `msg` is in amino format.
        // Weird, but that's how the Skip API responds.
        return aminoTypes.fromAmino({
          type: aminoConverters[msg_type_url].aminoType,
          value: JSON.parse(msg),
        })
      })

      const signed = await signWithEthSecp256k1(
        chain_id,
        initiaAddress,
        messages,
        { amount: [], gas: "1" },
        "",
      )

      const tx = Tx.fromPartial({
        body: TxBody.decode(signed.bodyBytes),
        authInfo: AuthInfo.decode(signed.authInfoBytes),
        signatures: signed.signatures,
      })

      return { signer: initiaAddress, hook: toBase64(Tx.encode(tx).finish()) }
    },
  })
}

export interface BridgeHistory {
  timestamp: number
  chainId: string
  txHash: string
  route: RouteResponseJson
  values: FormValues
}

export function useBridgeHistory() {
  return useLocalStorage<BridgeHistory[]>(LocalStorageKey.BRIDGE_HISTORY, [])
}

export function useTrackTxQuery() {
  const [, setBridgeHistory] = useBridgeHistory()
  const { values, route, txHash } = useBridgePreviewState()
  const { srcChainId } = values
  const skip = useSkip()
  return useQuery({
    queryKey: skipQueryKeys.txTrack(srcChainId, txHash).queryKey,
    queryFn: async () => {
      try {
        const response = await skip
          .post("v2/tx/track", { json: { tx_hash: txHash, chain_id: srcChainId } })
          .json<TrackResponseJson>()
        setBridgeHistory((prev = []) => [
          ...prev,
          { timestamp: Date.now(), chainId: srcChainId, txHash: response.tx_hash, route, values },
        ])
        return response
      } catch (error) {
        throw new Error(await normalizeError(error))
      }
    },
    select: ({ tx_hash }) => tx_hash,
    enabled: !!txHash,
    retry: 6,
    retryDelay: 1000,
    staleTime: STALE_TIMES.INFINITY,
  })
}

export function useTxStatusQuery(
  srcChainId: string,
  trackedTxHash?: string,
  route?: RouterRouteResponseJson,
) {
  const skip = useSkip()
  const isLz = has("lz_transfer", path(["operations", 0], route))

  return useQuery({
    queryKey: skipQueryKeys.txStatus(srcChainId, trackedTxHash, isLz).queryKey,
    queryFn: () => {
      if (!trackedTxHash) throw new Error("Transaction hash is required")
      return skip
        .get("v2/tx/status", {
          searchParams: { tx_hash: trackedTxHash, chain_id: srcChainId, is_lz: isLz },
        })
        .json<StatusResponseJson>()
    },
    enabled: !!trackedTxHash,
    refetchInterval: ({ state: { data } }) => {
      if (!data) return false
      const { status } = data
      if (status === "STATE_COMPLETED") return false
      return 1000
    },
    staleTime: STALE_TIMES.INFINITY,
  })
}
