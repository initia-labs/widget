const NAMESPACE = "initia-widget"

export const LocalStorageKey = {
  // ui
  ADDED_CHAIN_IDS: `${NAMESPACE}:chain-ids:added`,
  OPENED_CHAIN_IDS: `${NAMESPACE}:chain-ids:opened`,

  // wallet
  PUBLIC_KEY: `${NAMESPACE}:public-key`,
  RECENT_WALLET: `${NAMESPACE}:recent-wallet`,

  // tx fee
  FEE_DENOM: `${NAMESPACE}:fee-denom`,

  // bridge
  BRIDGE_SRC_CHAIN_ID: `${NAMESPACE}:bridge:src-chain-id`,
  BRIDGE_SRC_DENOM: `${NAMESPACE}:bridge:src-denom`,
  BRIDGE_DST_CHAIN_ID: `${NAMESPACE}:bridge:dst-chain-id`,
  BRIDGE_DST_DENOM: `${NAMESPACE}:bridge:dst-denom`,
  BRIDGE_QUANTITY: `${NAMESPACE}:bridge:quantity`,
  BRIDGE_SLIPPAGE_PERCENT: `${NAMESPACE}:bridge:slippage-percent`,
  BRIDGE_ROUTE_TYPE: `${NAMESPACE}:bridge:route-type`,
  BRIDGE_HISTORY: `${NAMESPACE}:bridge:history`,

  // op
  OP_REMINDER: `${NAMESPACE}:op:reminder`,
}
