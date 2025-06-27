import { LocalStorageKey } from "@/data/constants"

export function resetBridgeFormValues() {
  ;[
    LocalStorageKey.BRIDGE_SRC_CHAIN_ID,
    LocalStorageKey.BRIDGE_SRC_DENOM,
    LocalStorageKey.BRIDGE_DST_CHAIN_ID,
    LocalStorageKey.BRIDGE_DST_DENOM,
    LocalStorageKey.BRIDGE_QUANTITY,
    LocalStorageKey.BRIDGE_ROUTE_TYPE,
  ].forEach((key) => localStorage.removeItem(key))
}
