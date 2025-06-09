import { useCallback } from "react"
import { useLocalStorage } from "react-use"
import type { RouteResponseJson } from "@skip-go/client"
import { LocalStorageKey } from "@/data/constants"
import type { FormValues } from "./form"

export interface TxIdentifier {
  chainId: string
  txHash: string
}

export interface HistoryDetails extends TxIdentifier {
  timestamp: number
  route: RouteResponseJson
  values: FormValues
  tracked?: boolean
  state?: "success" | "error"
}

const detailKeyOf = ({ chainId, txHash }: TxIdentifier) =>
  `${LocalStorageKey.BRIDGE_HISTORY}:${chainId}:${txHash}`

export const BRIDGE_HISTORY_LIMIT = 100

export function useBridgeHistoryList() {
  const [list = [], setList] = useLocalStorage<TxIdentifier[]>(LocalStorageKey.BRIDGE_HISTORY, [])

  const addHistoryItem = useCallback(
    (tx: TxIdentifier, details: HistoryDetails) => {
      localStorage.setItem(detailKeyOf(tx), JSON.stringify(details))
      setList((prev = []) => {
        prev
          .slice(BRIDGE_HISTORY_LIMIT - 1)
          .forEach((tx) => localStorage.removeItem(detailKeyOf(tx))) // Remove old items from localStorage
        return [tx, ...prev.slice(0, BRIDGE_HISTORY_LIMIT - 1)] // Keep only the last 100 items
      })
    },
    [setList],
  )

  const getHistoryDetails = useCallback((tx: TxIdentifier) => {
    const item = localStorage.getItem(detailKeyOf(tx))
    if (!item) return null
    return JSON.parse(item) as HistoryDetails
  }, [])

  return { history: list, addHistoryItem, getHistoryDetails }
}

export function useBridgeHistoryDetails(tx: TxIdentifier) {
  return useLocalStorage<HistoryDetails>(detailKeyOf(tx))
}
