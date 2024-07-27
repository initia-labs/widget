import { z } from "zod"
import { Address } from "@/public/utils"

export const RecipientSchema = z
  .string()
  .nonempty("Recipient address is required")
  .refine((address) => Address.validate(address), "Invalid address")

/** Normalize the chain information from both Initia registry and Skip API */

export interface BaseChain {
  chainId: string
  name: string
  logoUrl: string
}

export interface BaseAsset {
  denom: string
  symbol: string
  decimals: number
  name?: string
  logoUrl: string
  balance?: string
  value?: number
}
