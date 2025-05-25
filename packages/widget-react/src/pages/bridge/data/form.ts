import { z } from "zod"
import { atom, useAtomValue } from "jotai"
import { useFormContext } from "react-hook-form"
import { LocalStorageKey } from "@/data/constants"
import { useLayer1 } from "@/data/chains"

export function useIsTestnet() {
  const chain = useLayer1()
  return chain.network_type === "testnet"
}

export const FormValuesSchema = z.object({
  srcChainId: z.string().nonempty(),
  srcDenom: z.string().nonempty(),
  dstChainId: z.string().nonempty(),
  dstDenom: z.string().nonempty(),
  quantity: z.string().nonempty("Amount is required"),
  sender: z.string().nonempty(),
  cosmosWalletName: z.string().optional(),
  recipient: z.string().nonempty("Recipient address is required"),
  slippagePercent: z.string().nonempty(),
})

export type FormValues = z.infer<typeof FormValuesSchema>

export function useBridgeForm() {
  return useFormContext<FormValues>()
}

export const defaultValuesAtom = atom<Partial<FormValues>>()

export function useDefaultValues() {
  const defaultValues = useAtomValue(defaultValuesAtom)
  const isTestnet = useIsTestnet()

  const baseDefaultValues = {
    quantity: "",
    slippagePercent: localStorage.getItem(LocalStorageKey.SLIPPAGE_PERCENT) || "0.5",
  }

  const testnetDefaultValues = {
    srcChainId: "initiation-2",
    srcDenom: "uusdc",
    dstChainId: "initiation-2",
    dstDenom: "uinit",
  }

  const mainnetDefaultValues = {
    srcChainId: "interwoven-1",
    srcDenom: "ibc/6490A7EAB61059BFC1CDDEB05917DD70BDF3A611654162A1A47DB930D40D8AF4",
    dstChainId: "interwoven-1",
    dstDenom: "uinit",
  }

  return {
    ...baseDefaultValues,
    ...(isTestnet ? testnetDefaultValues : mainnetDefaultValues),
    ...defaultValues,
  }
}
