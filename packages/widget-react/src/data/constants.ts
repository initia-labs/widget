const NAMESPACE = "initia-widget"

export const LocalStorageKey = {
  // ui
  ADDED_CHAIN_IDS: `${NAMESPACE}:chain-ids`,
  OPENED_CHAIN_IDS: `${NAMESPACE}:opened-chains`,

  // wallet
  PUBLIC_KEY: `${NAMESPACE}:public-key`,

  // tx fee
  FEE_DENOM: `${NAMESPACE}:fee-denom`,

  // bridge
  SLIPPAGE_PERCENT: `${NAMESPACE}:slippage-percent`,
  BRIDGE_HISTORY: `${NAMESPACE}:bridge-history`,
}
