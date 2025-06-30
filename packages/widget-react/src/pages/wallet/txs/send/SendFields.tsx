import BigNumber from "bignumber.js"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { useMutation } from "@tanstack/react-query"
import { useFormContext } from "react-hook-form"
import { useChain, usePricesQuery } from "@/data/chains"
import { AddressUtils, formatAmount, formatNumber, toAmount, toQuantity } from "@/public/utils"
import { useInitiaWidget } from "@/public/data/hooks"
import { useAsset } from "@/data/assets"
import { useBalances } from "@/data/account"
import Page from "@/components/Page"
import Footer from "@/components/Footer"
import Button from "@/components/Button"
import ChainAssetQuantityLayout from "@/components/form/ChainAssetQuantityLayout"
import ModalTrigger from "@/components/ModalTrigger"
import AssetOnChainButton from "@/components/form/AssetOnChainButton"
import BalanceButton from "@/components/form/BalanceButton"
import QuantityInput from "@/components/form/QuantityInput"
import RecipientInput from "@/components/form/RecipientInput"
import InputHelp from "@/components/form/InputHelp"
import FormHelp from "@/components/form/FormHelp"
import type { FormValues } from "./Send"
import SelectChainAsset from "./SelectChainAsset"
import styles from "./SendFields.module.css"

export const SendFields = () => {
  const { address, initiaAddress, requestTxSync } = useInitiaWidget()

  const { register, watch, setValue, handleSubmit, formState } = useFormContext<FormValues>()
  const { chainId, denom, quantity, memo } = watch()

  const chain = useChain(chainId)
  const balances = useBalances(chain)
  const asset = useAsset(denom, chain)
  const { data: prices } = usePricesQuery(chain.chainId)
  const { decimals } = asset
  const balance = balances.find((coin) => coin.denom === denom)?.amount ?? "0"
  const price = prices?.find(({ id }) => id === denom)?.price

  const { mutate, isPending } = useMutation({
    mutationFn: ({ chainId, denom, quantity, recipient, memo }: FormValues) => {
      const amount = toAmount(quantity, decimals)
      const messages = [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: MsgSend.fromPartial({
            fromAddress: initiaAddress,
            toAddress: AddressUtils.toBech32(recipient),
            amount: [{ denom, amount }],
          }),
        },
      ]
      return requestTxSync({ messages, memo, chainId, internal: "/" })
    },
  })

  return (
    <Page title="Send">
      <form onSubmit={handleSubmit((values) => mutate(values))}>
        <div className={styles.fields}>
          <ChainAssetQuantityLayout
            selectButton={
              <ModalTrigger
                title="Select chain and asset"
                content={(close) => <SelectChainAsset afterSelect={close} />}
              >
                <AssetOnChainButton asset={asset} chain={chain} />
              </ModalTrigger>
            }
            quantityInput={<QuantityInput />}
            balanceButton={
              <BalanceButton
                onClick={() =>
                  setValue("quantity", toQuantity(balance, decimals), { shouldValidate: true })
                }
              >
                {formatAmount(balance, { decimals })}
              </BalanceButton>
            }
            value={!quantity ? "0" : !price ? "-" : formatNumber(BigNumber(quantity).times(price))}
            errorMessage={formState.errors.quantity?.message}
          />

          <div className={styles.divider} />

          <RecipientInput myAddress={address} />

          <div>
            <label htmlFor="memo">Memo (optional)</label>
            <input {...register("memo")} id="memo" autoComplete="off" />
            <InputHelp level="error">{formState.errors.memo?.message}</InputHelp>
          </div>

          <FormHelp.Stack>
            {BigNumber(quantity).gt(0) &&
              BigNumber(quantity).isEqualTo(toQuantity(balance, decimals)) && (
                <FormHelp level="warning">Make sure to leave enough for fees</FormHelp>
              )}

            {!memo && (
              <FormHelp level="warning">Check if the above transaction requires a memo</FormHelp>
            )}
          </FormHelp.Stack>
        </div>

        <Footer>
          <Button.White type="submit" loading={isPending} disabled={!formState.isValid}>
            Confirm
          </Button.White>
        </Footer>
      </form>
    </Page>
  )
}

export default SendFields
