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
  callback?: ((result: TxResult) => void) | null
  internal?: boolean
  returnPath?: string
}

interface TxRequestHandler {
  txRequest: Required<TxRequest>
  resolve: (signedTx: TxRaw) => Promise<void>
  reject: (error: Error) => void
}

interface TxResult {
  txRequest: Required<TxRequest>
  txHash?: string
  error?: Error
}

export const TX_APPROVAL_MUTATION_KEY = "approve"
export const txRequestHandlerAtom = atom<TxRequestHandler>()
export const txResultAtom = atom<TxResult>()

export function useTxRequestHandler() {
  const txRequest = useAtomValue(txRequestHandlerAtom)
  if (!txRequest) throw new Error("Tx request not found")
  return txRequest
}

export function useTxResult() {
  const txResult = useAtomValue(txResultAtom)
  if (!txResult) throw new Error("Tx result not found")
  return txResult
}

export function useTx() {
  const navigate = useNavigate()
  const address = useInitiaAddress()
  const { defaultChainId } = useConfig()
  const { openWidget, closeWidget } = useWidgetVisibility()
  const { openModal, closeModal } = useModal()
  const setTxRequestAtom = useSetAtom(txRequestHandlerAtom)
  const setTxResultAtom = useSetAtom(txResultAtom)
  const createSigningStargateClient = useCreateSigningStargateClient()

  const estimateGas = async ({ messages, memo, chainId = defaultChainId }: TxRequest) => {
    const client = await createSigningStargateClient(chainId)
    return client.simulate(address, messages, memo)
  }

  type Broadcaster<T> = (client: SigningStargateClient, signedTxBytes: Uint8Array) => Promise<T>
  const requestTx = async <T>({
    txRequest: rawTxRequest,
    broadcaster,
    getTransactionHash,
  }: {
    txRequest: TxRequest
    broadcaster: Broadcaster<T>
    getTransactionHash: (response: T) => string
  }): Promise<T> => {
    const defaultTxRequest = {
      memo: "",
      chainId: defaultChainId,
      gas: rawTxRequest.gas || (await estimateGas(rawTxRequest)),
      gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      fee: null,
      callback: null,
      internal: false,
      returnPath: "/",
    }

    const txRequest = { ...defaultTxRequest, ...rawTxRequest }

    return new Promise<T>((resolve, reject) => {
      setTxRequestAtom({
        txRequest,
        resolve: async (signedTx: TxRaw) => {
          try {
            const client = await createSigningStargateClient(txRequest.chainId)
            const response = await broadcaster(client, TxRaw.encode(signedTx).finish())
            resolve(response)
            finalize({ txRequest, txHash: getTransactionHash(response) })
          } catch (error) {
            reject(error)
            finalize({ txRequest, error: error as Error })
          }
        },
        reject: (error: Error) => {
          reject(error)
          finalize({ txRequest, error })
        },
      })

      if (txRequest.callback) {
        openModal({ path: "/tx" })
      } else if (txRequest.internal) {
        navigate("/tx")
      } else {
        openWidget("/tx")
      }

      const finalize = (result: TxResult) => {
        if (txRequest.callback) {
          closeModal()
          txRequest.callback(result)
        } else if (txRequest.internal) {
          setTxResultAtom(result)
          navigate("/tx/result")
        } else {
          navigate("/blank")
          closeWidget()
        }
        setTxRequestAtom(undefined)
      }
    })
  }

  const requestTxSync = (txRequest: TxRequest) => {
    return requestTx<string>({
      txRequest,
      broadcaster: async (client, signedTxBytes) => {
        const transactionHash = await client.broadcastTxSync(signedTxBytes)
        return transactionHash
      },
      getTransactionHash: (response) => response,
    })
  }

  const requestTxBlock = (txRequest: TxRequest) => {
    return requestTx<DeliverTxResponse>({
      txRequest,
      broadcaster: async (client, signedTxBytes) => {
        const response = await client.broadcastTx(signedTxBytes)
        if (response.code !== 0) throw new Error(response.rawLog)
        return response
      },
      getTransactionHash: (response) => response.transactionHash,
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
