import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import type { EncodeObject } from "@cosmjs/proto-signing"
import type { DeliverTxResponse, SigningStargateClient, StdFee } from "@cosmjs/stargate"
import { atom, useAtomValue, useSetAtom } from "jotai"
import { useNavigate } from "@/lib/router"
import { DEFAULT_GAS_ADJUSTMENT } from "@/public/data/constants"
import { useInitiaAddress } from "@/public/data/hooks"
import { useModal } from "@/public/app/ModalContext"
import { useConfig } from "./config"
import { useCreateSigningStargateClient } from "./signer"
import { useWidgetVisibility } from "./ui"

export interface TxRequest {
  messages: EncodeObject[]
  memo?: string
  chainId?: string
  gasAdjustment?: number
  gas?: number
  fee?: StdFee | null

  /** Internal use only */
  internal?: boolean | string | number // number for disabling notification
}

interface TxRequestHandler {
  txRequest: Required<TxRequest>
  resolve: (signedTx: TxRaw) => Promise<void>
  reject: (error: Error) => void
}

export interface TxStatus {
  status: "loading" | "success" | "error"
  chainId: string
  txHash?: string
  error?: Error
}

export const TX_APPROVAL_MUTATION_KEY = "approve"
export const txRequestHandlerAtom = atom<TxRequestHandler>()
export const txStatusAtom = atom<TxStatus | null>(null)

export function useTxRequestHandler() {
  const txRequest = useAtomValue(txRequestHandlerAtom)
  if (!txRequest) throw new Error("Tx request not found")
  return txRequest
}

export function useTx() {
  const navigate = useNavigate()
  const address = useInitiaAddress()
  const { defaultChainId } = useConfig()
  const { openWidget, closeWidget } = useWidgetVisibility()
  const { openModal, closeModal } = useModal()
  const setTxRequestHandler = useSetAtom(txRequestHandlerAtom)
  const setTxStatus = useSetAtom(txStatusAtom)
  const createSigningStargateClient = useCreateSigningStargateClient()

  const estimateGas = async ({ messages, memo, chainId = defaultChainId }: TxRequest) => {
    const client = await createSigningStargateClient(chainId)
    return client.simulate(address, messages, memo)
  }

  type Broadcaster<T> = (client: SigningStargateClient, signedTxBytes: Uint8Array) => Promise<T>
  const requestTx = async <T>({
    txRequest: rawTxRequest,
    broadcaster,
  }: {
    txRequest: TxRequest
    broadcaster: Broadcaster<T>
  }): Promise<T> => {
    const defaultTxRequest = {
      memo: "",
      chainId: defaultChainId,
      gas: rawTxRequest.gas || (await estimateGas(rawTxRequest)),
      gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      fee: null,
      internal: false,
    }

    const txRequest = { ...defaultTxRequest, ...rawTxRequest }

    return new Promise<T>((resolve, reject) => {
      setTxRequestHandler({
        txRequest,
        resolve: async (signedTx: TxRaw) => {
          try {
            const client = await createSigningStargateClient(txRequest.chainId)
            const response = await broadcaster(client, TxRaw.encode(signedTx).finish())
            resolve(response)
            finalize()
          } catch (error) {
            reject(error)
            finalize()
          }
        },
        reject: (error: Error) => {
          reject(error)
          finalize()
        },
      })

      if (!txRequest.internal) {
        openWidget("/tx")
      } else {
        openModal({ path: "/tx" })
      }

      const finalize = () => {
        if (!txRequest.internal) {
          navigate("/blank")
          closeWidget()
          return
        }

        if (typeof txRequest.internal === "string") {
          navigate(txRequest.internal)
        }
        closeModal()
      }
    })
  }

  const requestTxSync = async (txRequest: TxRequest) => {
    const chainId = txRequest.chainId ?? defaultChainId

    try {
      const txHash = await requestTx<string>({
        txRequest,
        broadcaster: async (client, signedTxBytes) => {
          const transactionHash = await client.broadcastTxSync(signedTxBytes)
          return transactionHash
        },
      })

      if (txRequest.internal && typeof txRequest.internal !== "number") {
        setTxStatus({ txHash, chainId, status: "loading" })
        waitForTxConfirmation({ txHash, chainId: txRequest.chainId })
          .then((tx) => {
            setTxStatus({ status: tx.code === 0 ? "success" : "error", chainId, txHash })
          })
          .catch(() => {
            setTxStatus({ status: "error", chainId, txHash })
          })
      }

      return txHash
    } catch (error) {
      if (txRequest.internal && typeof txRequest.internal !== "number") {
        setTxStatus({ status: "error", chainId, error: error as Error })
      }
      throw error
    }
  }

  const requestTxBlock = (txRequest: TxRequest) => {
    return requestTx<DeliverTxResponse>({
      txRequest,
      broadcaster: async (client, signedTxBytes) => {
        const response = await client.broadcastTx(signedTxBytes)
        if (response.code !== 0) throw new Error(response.rawLog)
        return response
      },
    })
  }

  const waitForTxConfirmation = async ({
    txHash,
    chainId = defaultChainId,
    timeoutSeconds = 60,
    intervalSeconds = 1,
  }: {
    txHash: string
    chainId?: string
    timeoutSeconds?: number
    intervalSeconds?: number
  }) => {
    const client = await createSigningStargateClient(chainId)
    const start = Date.now()
    const timeoutMs = timeoutSeconds * 1000

    while (true) {
      const tx = await client.getTx(txHash)

      if (tx) {
        return tx
      }

      if (Date.now() - start >= timeoutMs) {
        throw new Error(
          `Transaction was submitted, but not found on the chain within ${timeoutSeconds} seconds.`,
        )
      }

      await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000))
    }
  }

  return { estimateGas, requestTxSync, requestTxBlock, waitForTxConfirmation }
}
