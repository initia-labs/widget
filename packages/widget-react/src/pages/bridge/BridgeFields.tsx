import BigNumber from "bignumber.js"
import { sentenceCase } from "change-case"
import { useEffect, useMemo, useState } from "react"
import { useDebounce, useLocalStorage } from "react-use"
import {
  IconChevronDown,
  IconInfoFilled,
  IconSettingFilled,
  IconWarningFilled,
} from "@initia/icons-react"
import { useNavigate } from "@/lib/router"
import { formatAmount, formatNumber, toQuantity } from "@/public/utils"
import { useModal } from "@/public/app/ModalContext"
import { LocalStorageKey } from "@/data/constants"
import Button from "@/components/Button"
import ChainAssetQuantityLayout from "@/components/form/ChainAssetQuantityLayout"
import BalanceButton from "@/components/form/BalanceButton"
import QuantityInput from "@/components/form/QuantityInput"
import Footer from "@/components/Footer"
import ModalTrigger from "@/components/ModalTrigger"
import FormHelp from "@/components/form/FormHelp"
import PlainModalContent from "@/components/PlainModalContent"
import AnimatedHeight from "@/components/AnimatedHeight"
import WidgetTooltip from "@/components/WidgetTooltip"
import { formatDuration, formatFees } from "./data/format"
import type { FormValues } from "./data/form"
import { FormValuesSchema, useBridgeForm } from "./data/form"
import { useChainType, useSkipChain } from "./data/chains"
import { useSkipAsset } from "./data/assets"
import { FeeBehaviorJson, useIsOpWithdrawable, useRouteQuery } from "./data/simulate"
import { useSkipBalance, useSkipBalancesQuery } from "./data/balance"
import SelectedChainAsset from "./SelectedChainAsset"
import BridgeAccount from "./BridgeAccount"
import SlippageControl from "./SlippageControl"
import type { RouteType } from "./SelectRouteOption"
import SelectRouteOption from "./SelectRouteOption"
import styles from "./BridgeFields.module.css"

const BridgeFields = () => {
  const navigate = useNavigate()

  const [selectedType, setSelectedType] = useLocalStorage<RouteType>(
    LocalStorageKey.BRIDGE_ROUTE_TYPE,
    "default",
    { raw: true },
  )

  // form
  const { watch, setValue, handleSubmit, trigger, formState } = useBridgeForm()
  const values = watch()
  const { srcChainId, srcDenom, dstChainId, dstDenom, quantity, sender, slippagePercent } = values

  const srcChain = useSkipChain(srcChainId)
  const srcChainType = useChainType(srcChain)
  const dstChain = useSkipChain(dstChainId)
  const dstChainType = useChainType(dstChain)
  const srcAsset = useSkipAsset(srcDenom, srcChainId)
  const dstAsset = useSkipAsset(dstDenom, dstChainId)
  const { data: balances } = useSkipBalancesQuery(sender, srcChainId)
  const srcBalance = useSkipBalance(sender, srcChainId, srcDenom)

  useEffect(() => {
    if (Number(quantity)) trigger()
  }, [srcBalance, quantity, trigger])

  // simulation
  const [debouncedQuantity, setDebouncedQuantity] = useState(quantity)
  // Avoid hitting the simulation API on every keystroke.  Wait a short period
  // after the user stops typing before updating the debounced value.
  useDebounce(() => setDebouncedQuantity(quantity), 300, [quantity])

  const isExternalRoute = srcChainType !== "initia" && dstChainType !== "initia"
  const isOpWithdrawable = useIsOpWithdrawable()
  const routeQueryDefault = useRouteQuery(debouncedQuantity, {
    disabled: isExternalRoute,
  })
  const routeQueryOpWithdrawal = useRouteQuery(debouncedQuantity, {
    isOpWithdraw: true,
    disabled: !isOpWithdrawable,
  })
  const routeQuery =
    isOpWithdrawable && selectedType === "op" ? routeQueryOpWithdrawal : routeQueryDefault
  const { data, isLoading, isFetching, isFetched } = routeQuery

  // Local state to retain the last successful simulated route
  const [previousData, setPreviousData] = useState(data)
  useEffect(() => {
    if (!data) return
    // When the user changes only the `amount`, we still re-fetch the `route` each time.
    // Changing the `chain` or `asset` can affect estimated fees, time, or warnings.
    // But changing only the `amount` affects only the received amount and its USD value.
    // So, it is okay to keep showing the old simulation result for a short time.
    setPreviousData({ ...data, amount_out: "0", usd_amount_in: "0", usd_amount_out: "0" })
  }, [data])
  const route = isFetched ? data : debouncedQuantity ? previousData : undefined
  const isSimulating = debouncedQuantity && (isLoading || isFetching)

  const flip = () => {
    setValue("srcChainId", dstChainId)
    setValue("srcDenom", dstDenom)
    setValue("dstChainId", srcChainId)
    setValue("dstDenom", srcDenom)
    if (Number(quantity)) trigger()
  }

  // submit
  const { openModal, closeModal } = useModal()
  const submit = handleSubmit((values: FormValues) => {
    if (route?.warning) {
      const { type = "", message } = route.warning ?? {}
      openModal({
        content: (
          <PlainModalContent
            type="warning"
            icon={<IconWarningFilled size={40} />}
            title={sentenceCase(type)}
            primaryButton={{ label: "Cancel", onClick: closeModal }}
            secondaryButton={{
              label: "Proceed anyway",
              onClick: () => {
                navigate("/bridge/preview", { route, values })
                closeModal()
              },
            }}
          >
            <p className={styles.warning}>{message}</p>
          </PlainModalContent>
        ),
      })
      return
    }

    navigate("/bridge/preview", { route, values })
  })

  // disabled
  const feeErrorMessage = useMemo(() => {
    for (const fee of route?.estimated_fees ?? []) {
      const balance = balances?.[fee.origin_asset.denom]?.amount
      if (!balance || BigNumber(balance).lt(fee.amount ?? 0)) {
        return `Insufficient ${fee.origin_asset.symbol} for fees`
      }
    }
  }, [balances, route])

  const disabledMessage = useMemo(() => {
    if (!values.sender) return "Connect wallet"
    if (!values.quantity) return "Enter amount"
    if (!debouncedQuantity) return "Enter amount"
    if (!values.recipient) return "Enter recipient address"
    if (formState.errors.quantity) return formState.errors.quantity.message
    const result = FormValuesSchema.safeParse(values)
    if (!result.success) return `Invalid ${result.error.issues[0].path}`
    if (!route) return "Route not found"
    // This should be enabled later when the fee behavior is defined by the backend
    if (feeErrorMessage) return // feeErrorMessage
  }, [debouncedQuantity, feeErrorMessage, formState, route, values])

  // render
  const received = route ? formatAmount(route.amount_out, { decimals: dstAsset.decimals }) : "0"

  const withdrawalStatusLink = (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <span className={styles.link} onClick={() => navigate("/op/withdrawals")}>
      Withdrawal status
    </span>
  )

  const isMaxAmount =
    BigNumber(quantity).gt(0) &&
    BigNumber(quantity).isEqualTo(toQuantity(srcBalance?.amount, srcBalance?.decimals ?? 0))

  const deductedFees = route?.estimated_fees?.filter(
    ({ fee_behavior }) => fee_behavior === FeeBehaviorJson.FEE_BEHAVIOR_DEDUCTED,
  )

  const additionalFees = route?.estimated_fees?.filter(
    ({ fee_behavior }) => fee_behavior === FeeBehaviorJson.FEE_BEHAVIOR_ADDITIONAL,
  )

  return (
    <form className={styles.form} onSubmit={submit}>
      <ChainAssetQuantityLayout
        selectButton={<SelectedChainAsset type="src" />}
        accountButton={srcChainType === "cosmos" && <BridgeAccount type="src" />}
        quantityInput={<QuantityInput />}
        balanceButton={
          <BalanceButton
            onClick={() =>
              setValue("quantity", toQuantity(srcBalance?.amount, srcAsset?.decimals), {
                shouldValidate: true,
              })
            }
          >
            {formatAmount(srcBalance?.amount, { decimals: srcAsset.decimals })}
          </BalanceButton>
        }
        value={!route ? "0" : route.usd_amount_in ? formatNumber(route.usd_amount_in) : "-"}
      />

      <div className={styles.arrow}>
        <div className={styles.divider} />
        <button type="button" className={styles.flip} onClick={() => flip()}>
          <IconChevronDown size={16} />
        </button>
      </div>

      <ChainAssetQuantityLayout
        selectButton={<SelectedChainAsset type="dst" />}
        accountButton={<BridgeAccount type="dst" />}
        quantityInput={<QuantityInput.ReadOnly>{received}</QuantityInput.ReadOnly>}
        value={!route ? "0" : route.usd_amount_out ? formatNumber(route.usd_amount_out) : "-"}
      />

      <Footer
        extra={
          <>
            <AnimatedHeight>
              {BigNumber(quantity).gt(0) && isOpWithdrawable ? (
                <SelectRouteOption.Stack>
                  <SelectRouteOption
                    label="Minitswap"
                    query={routeQueryDefault}
                    value="default"
                    onSelect={setSelectedType}
                    checked={selectedType === "default"}
                  />
                  <SelectRouteOption
                    label="Optimistic bridge"
                    query={routeQueryOpWithdrawal}
                    value="op"
                    onSelect={setSelectedType}
                    checked={selectedType === "op"}
                  />
                </SelectRouteOption.Stack>
              ) : null}
            </AnimatedHeight>

            <FormHelp.Stack>
              {route && isOpWithdrawable && selectedType === "op" && (
                <FormHelp level="info">
                  Withdraw transaction is required when using the Optimistic bridge. Status of all
                  withdrawals can be viewed on the {withdrawalStatusLink} page.
                </FormHelp>
              )}
              {isMaxAmount && (
                <FormHelp level="warning">Make sure to leave enough for fees</FormHelp>
              )}
              {route?.warning && <FormHelp level="warning">{route.warning.message}</FormHelp>}
              {route?.extra_warnings?.map((warning) => (
                <FormHelp level="warning" key={warning}>
                  {warning}
                </FormHelp>
              ))}
            </FormHelp.Stack>

            <AnimatedHeight>
              {route && (
                <div className={styles.meta}>
                  {formatFees(route.estimated_fees) && (
                    <div className={styles.row}>
                      <span className={styles.title}>Estimated fees</span>
                      <p>
                        {formatFees(deductedFees) && (
                          <span className={styles.description}>
                            {formatFees(deductedFees)}
                            <WidgetTooltip label="This is the fee that is deducted from the final amount received.">
                              <span className={styles.icon}>
                                <IconInfoFilled size={12} />
                              </span>
                            </WidgetTooltip>
                          </span>
                        )}
                        {formatFees(additionalFees) && (
                          <span className={styles.description}>
                            {formatFees(additionalFees)}
                            <WidgetTooltip label="This is the fee that occurs prior to the transaction.">
                              <span className={styles.icon}>
                                <IconInfoFilled size={12} />
                              </span>
                            </WidgetTooltip>
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {formatDuration(route.estimated_route_duration_seconds) && (
                    <div className={styles.row}>
                      <span className={styles.title}>Estimated route duration</span>
                      <span className={styles.description}>
                        {formatDuration(route.estimated_route_duration_seconds)}
                      </span>
                    </div>
                  )}

                  {route.does_swap && (
                    <div className={styles.row}>
                      <span className={styles.title}>Slippage</span>
                      <span className={styles.description}>
                        <span>{slippagePercent}%</span>

                        <ModalTrigger
                          title="Slippage tolerance"
                          content={(close) => <SlippageControl afterConfirm={close} />}
                          className={styles.edit}
                        >
                          <IconSettingFilled size={12} />
                        </ModalTrigger>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </AnimatedHeight>
          </>
        }
      >
        <Button.White loading={isSimulating && "Simulating..."} disabled={!!disabledMessage}>
          {disabledMessage ?? "Preview route"}
        </Button.White>
      </Footer>
    </form>
  )
}

export default BridgeFields
