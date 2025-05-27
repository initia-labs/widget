import { useAccount } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import { useTx } from "@/data/tx"
import { useConfig } from "@/data/config"
import { useWidgetVisibility } from "@/data/ui"
import { useDefaultChain } from "@/data/chains"
import { accountQueryKeys, useUsernameClient } from "@/data/account"
import type { FormValues } from "@/pages/bridge/data/form"
import { STALE_TIMES } from "@/data/http"
import { Address } from "../utils"

export function useInitiaAddress() {
  const hexAddress = useHexAddress()
  return Address.toBech32(hexAddress)
}

export function useHexAddress() {
  const { address } = useAccount()
  return address ?? ""
}

export function useAddress() {
  const defaultChain = useDefaultChain()
  const initiaAddress = useInitiaAddress()
  const hexAddress = useHexAddress()
  if (defaultChain.metadata?.minitia?.type === "minievm") {
    return hexAddress
  }
  return initiaAddress
}

export function useUsernameQuery() {
  const address = useAddress()
  const client = useUsernameClient()
  return useQuery({
    queryKey: accountQueryKeys.username(client.restUrl, address).queryKey,
    queryFn: () => client.getUsername(address),
    enabled: !!address,
    staleTime: STALE_TIMES.MINUTE,
  })
}

export function useInitiaWidget() {
  const address = useAddress()
  const initiaAddress = useInitiaAddress()
  const hexAddress = useHexAddress()
  const { data: username } = useUsernameQuery()
  const { wallet } = useConfig()

  const { openWidget } = useWidgetVisibility()

  const openWallet = () => {
    openWidget("/")
  }

  const openBridge = (defaultValues?: Partial<FormValues>) => {
    openWidget("/bridge", defaultValues)
  }

  const tx = useTx()

  return {
    address,
    initiaAddress,
    hexAddress,
    username,
    wallet,
    openWallet,
    openBridge,
    ...tx,
  }
}
