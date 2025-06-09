import { z } from "zod"
import { pathOr } from "ramda"
import { useEffect, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { BalancesResponseJson } from "@skip-go/client"
import { useHistory, useNavigate } from "@/lib/router"
import { useAddress } from "@/public/data/hooks"
import { LocalStorageKey } from "@/data/constants"
import { useWidgetVisibility } from "@/data/ui"
import { quantitySuperRefine } from "@/data/form"
import AsyncBoundary from "@/components/AsyncBoundary"
import Page from "@/components/Page"
import Button from "@/components/Button"
import Status from "@/components/Status"
import Footer from "@/components/Footer"
import type { FormValues } from "./data/form"
import { FormValuesSchema, useDefaultValues } from "./data/form"
import { useGetDefaultAddress, useValidateAddress } from "./data/address"
import type { RouterAsset } from "./data/assets"
import { useSkipAssets } from "./data/assets"
import { skipQueryKeys } from "./data/skip"
import { useClaimableModal, useClaimableReminders } from "./op/reminder"
import BridgeFields from "./BridgeFields"
import styles from "./BridgeForm.module.css"

const BridgeForm = () => {
  useClaimableModal()

  const history = useHistory()
  const navigate = useNavigate()
  const { closeWidget } = useWidgetVisibility()
  const address = useAddress()

  const defaultValues = useDefaultValues()
  const validateRecipientAddress = useValidateAddress()

  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(
      FormValuesSchema.superRefine(({ srcChainId, srcDenom, quantity, sender }, ctx) => {
        const balances = queryClient.getQueryData<BalancesResponseJson>(
          skipQueryKeys.balances(srcChainId, sender).queryKey,
        )
        const balance = pathOr("0", ["chains", srcChainId, "denoms", srcDenom, "amount"], balances)
        const { decimals } = queryClient.getQueryData<RouterAsset>(
          skipQueryKeys.asset(srcChainId, srcDenom).queryKey,
        ) ?? { decimals: 0 }
        quantitySuperRefine({ quantity, balance, decimals }, ctx)
      }).superRefine(({ dstChainId, recipient }, ctx) => {
        if (!validateRecipientAddress(recipient, dstChainId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid address",
            path: ["recipient"],
          })
          return
        }
      }),
    ),
  })

  const { watch, setValue } = form
  const {
    srcChainId,
    dstChainId,
    srcDenom,
    dstDenom,
    quantity,
    slippagePercent,
    recipient,
    recipientType,
  } = watch()

  watch((_, { name }) => {
    if (name === "srcChainId" || name === "srcDenom") {
      setValue("quantity", "")
    }
  })

  // address
  const getDefaultAddress = useGetDefaultAddress()
  const defaultSenderAddress = getDefaultAddress(srcChainId)
  const defaultRecipientAddress = getDefaultAddress(dstChainId)
  const validateAddress = useValidateAddress()
  const isValidRecipient = validateAddress(recipient, dstChainId)
  useEffect(() => {
    setValue("cosmosWalletName", undefined)
    setValue("sender", defaultSenderAddress)
  }, [srcChainId, defaultSenderAddress, setValue])
  useEffect(() => {
    /**
     * UX decision
     *
     * When the user:
     *   1. Starts with a wallet-derived address (hexA).
     *   2. Manually enters a different address (hexB), disabling auto-fill.
     *   3. Switches to a non-EVM chain (e.g., Osmosis), clearing the field.
     *   4. Switches back to an EVM chain (e.g., Ethereum),
     * we keep the recipient field empty.
     *
     * Rationale:
     *   1. Safety first – avoids re-filling an address that the user may not notice.
     *   2. Clear rules – auto-fill only runs when the user has never typed a value.
     *   3. Simple state – no need to store multiple historical addresses.
     *
     * The user must now confirm or re-enter the intended recipient, making the
     * action explicit and predictable.
     */
    if (recipientType === "auto") setValue("recipient", defaultRecipientAddress)
    else if (!isValidRecipient) setValue("recipient", "")
  }, [address, defaultRecipientAddress, isValidRecipient, recipientType, setValue])

  // assets
  const srcAssets = useSkipAssets(srcChainId)
  const dstAssets = useSkipAssets(dstChainId)

  const errorMessage = useMemo(() => {
    if (!srcAssets.find((srcAsset) => srcAsset.denom === srcDenom)) {
      return `${srcDenom} is not available for bridge/swap on ${srcChainId}`
    }
    if (!dstAssets.find((dstAsset) => dstAsset.denom === dstDenom)) {
      return `${dstDenom} is not available for bridge/swap on ${dstChainId}`
    }
  }, [dstAssets, dstChainId, dstDenom, srcAssets, srcChainId, srcDenom])

  // localStorage
  useEffect(() => {
    if (errorMessage) return
    localStorage.setItem(LocalStorageKey.BRIDGE_SRC_CHAIN_ID, srcChainId)
    localStorage.setItem(LocalStorageKey.BRIDGE_SRC_DENOM, srcDenom)
    localStorage.setItem(LocalStorageKey.BRIDGE_DST_CHAIN_ID, dstChainId)
    localStorage.setItem(LocalStorageKey.BRIDGE_DST_DENOM, dstDenom)
    localStorage.setItem(LocalStorageKey.BRIDGE_QUANTITY, quantity)
    localStorage.setItem(LocalStorageKey.BRIDGE_SLIPPAGE_PERCENT, slippagePercent)
  }, [srcChainId, srcDenom, dstChainId, dstDenom, quantity, slippagePercent, errorMessage])

  // render
  const isBridgeWidget = history[0].path === "/bridge"

  const renderError = () => {
    return (
      <>
        <Status error>{errorMessage}</Status>
        <Footer>
          {isBridgeWidget ? (
            <Button.White onClick={closeWidget}>Close</Button.White>
          ) : (
            <Button.White onClick={() => navigate(-1)}>Go back</Button.White>
          )}
        </Footer>
      </>
    )
  }

  const { reminders } = useClaimableReminders()

  return (
    <Page
      title="Bridge/Swap"
      // The previous page may not be the intended destination.
      // To avoid unexpected behavior, it explicitly returns to the wallet page.
      returnTo={isBridgeWidget ? false : "/"}
      extra={
        <>
          <Button.Small onClick={() => navigate("/bridge/history")} unpadded>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
              <path d="m0 9.818 1.414-1.414 L2 8.99 V8 a7 7 0 1 1 7 7 v-2 a5 5 0 1 0-5-5 v1.354 l.95-.95 1.414 1.414 L3.182 13 0 9.818 Z" />
              <path d="M9 5.5 H7.5 v3.75 h3.75 v-1.5 H9 V5.5 Z" />
            </svg>
          </Button.Small>
          <Button.Small
            className={styles.link}
            onClick={() => navigate("/op/withdrawals")}
            disabled={!address}
          >
            <span>Withdrawal status</span>
            {reminders.length > 0 ? <div className={styles.badge} /> : null}
          </Button.Small>
        </>
      }
    >
      {errorMessage ? (
        renderError()
      ) : (
        <FormProvider {...form}>
          <AsyncBoundary>
            <BridgeFields />
          </AsyncBoundary>
        </FormProvider>
      )}
    </Page>
  )
}

export default BridgeForm
