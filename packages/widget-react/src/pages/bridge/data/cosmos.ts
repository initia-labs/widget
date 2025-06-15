import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { AddressUtils } from "@/public/utils"
import { LocalStorageKey } from "@/data/constants"

const DEFAULT_COSMOS_CHAIN_ID = "cosmoshub-4"

const cosmosWalletNameAtom = atomWithStorage(LocalStorageKey.BRIDGE_COSMOS_WALLET_NAME, "")

export function useCosmosWallets() {
  const [walletName, setWalletName] = useAtom(cosmosWalletNameAtom)

  const list = [
    {
      name: "Keplr",
      image: "https://assets.initia.xyz/images/wallets/Keplr.webp",
      getProvider: () => window.keplr,
      fallbackUrl: "https://keplr.app/get",
    },
    {
      name: "Leap",
      image: "https://assets.initia.xyz/images/wallets/Leap.webp",
      getProvider: () => window.leap,
      fallbackUrl: "https://leapwallet.io/download",
    },
  ]

  const cosmosWallet = list.find((wallet) => wallet.name === walletName)

  const connectCosmosWallet = (walletName: string) => {
    if (!walletName) setWalletName("")
    if (!list.find((wallet) => wallet.name === walletName)) return
    setWalletName(walletName)
  }

  return { list, cosmosWallet, connectCosmosWallet }
}

export function useCosmosAddress() {
  const { cosmosWallet, connectCosmosWallet } = useCosmosWallets()
  const [address, setAddress] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (cosmosWallet) {
      async function updateAddress() {
        try {
          const provider = cosmosWallet!.getProvider()

          const { bech32Address } = await provider!.getKey(DEFAULT_COSMOS_CHAIN_ID)
          setAddress(bech32Address)
        } catch {
          connectCosmosWallet("")
          setAddress(undefined)
        }
      }

      updateAddress()

      window.addEventListener("keplr_keystorechange", updateAddress)

      return () => {
        window.removeEventListener("keplr_keystorechange", updateAddress)
      }
    }
  }, [cosmosWallet, connectCosmosWallet])

  return (prefix: string) => {
    if (!address) return ""
    return AddressUtils.toBech32(AddressUtils.toHex(address), prefix)
  }
}
