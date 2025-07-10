import { toPrivyWallet, toPrivyWalletConnector } from "@privy-io/cross-app-connect/rainbow-kit"

export const initiaPrivyWalletOptions = {
  id: "cmbq1ozyc006al70lx4uciz0q",
  name: "Initia Global Wallet",
  iconUrl: "https://registry.initia.xyz/images/INIT.png",
  iconBackground: "#ffffff",
}

// wagmi
export const initiaPrivyWalletConnector = toPrivyWalletConnector(initiaPrivyWalletOptions)

// RainbowKit
export const initiaPrivyWallet = toPrivyWallet(initiaPrivyWalletOptions)
