import { z } from "zod"
import { useEffect, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconChevronRight } from "@initia/icons-react"
import { useLocationState, useNavigate } from "@/lib/router"
import { useInitiaWidget } from "@/public/data/hooks"
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
import BridgeFields from "./BridgeFields"

const BridgeForm = () => {
  const navigate = useNavigate()
  const showBackButton = useLocationState<boolean>()
  const { openWallet, closeWidget } = useInitiaWidget()

  const defaultValues = useDefaultValues()
  const validateRecipientAddress = useValidateAddress()

  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(
      FormValuesSchema.superRefine(({ srcChainId, srcDenom, quantity, sender }, ctx) => {
        const balance = queryClient.getQueryData<string>(
          skipQueryKeys.balance(sender, srcChainId, srcDenom).queryKey,
        )
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
  const { srcChainId, dstChainId, srcDenom, dstDenom, recipient } = watch()

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
    setValue("quantity", "")
  }, [srcChainId, srcDenom, setValue])
  useEffect(() => {
    if (isValidRecipient) return
    setValue("recipient", defaultRecipientAddress)
  }, [defaultRecipientAddress, isValidRecipient, setValue])

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

  const renderError = () => {
    return (
      <>
        <Status error>{errorMessage}</Status>
        <Footer>
          {showBackButton ? (
            <Button.White onClick={() => navigate(-1)}>Go back</Button.White>
          ) : (
            <Button.White onClick={closeWidget}>Close</Button.White>
          )}
        </Footer>
      </>
    )
  }

  return (
    <Page
      title="Bridge/Swap"
      onGoBack={showBackButton ? openWallet : false}
      extra={
        <>
          <Button.Small onClick={() => navigate("/bridge/history")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
              <path d="m0 9.818 1.414-1.414 L2 8.99 V8 a7 7 0 1 1 7 7 v-2 a5 5 0 1 0-5-5 v1.354 l.95-.95 1.414 1.414 L3.182 13 0 9.818 Z" />
              <path d="M9 5.5 H7.5 v3.75 h3.75 v-1.5 H9 V5.5 Z" />
            </svg>
          </Button.Small>
          <Button.Small onClick={() => navigate("/op/withdrawals")}>
            <span>Withdrawal status</span>
            <IconChevronRight size={12} />
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
