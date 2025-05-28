import BigNumber from "bignumber.js"
import { useEffect, useMemo, useState } from "react"
import { useDebounce, useLocalStorage } from "react-use"
import { IconChevronDown, IconSettingFilled } from "@initia/icons-react"
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
import { formatDuration, formatFees } from "./data/format"
import type { FormValues } from "./data/form"
import { FormValuesSchema, useBridgeForm } from "./data/form"
import { useChainType, useSkipChain } from "./data/chains"
import { useSkipAsset } from "./data/assets"
import { useIsOpWithdrawable, useRouteQuery } from "./data/simulate"
import { useSkipBalance } from "./data/balance"
import SelectedChainAsset from "./SelectedChainAsset"
import BridgeAccount from "./BridgeAccount"
import SlippageControl from "./SlippageControl"
import type { RouteType } from "./SelectRouteOption"
import SelectRouteOption from "./SelectRouteOption"
import BridgeWarningModalContent from "./BridgeWarningModalContent"
import styles from "./BridgeFields.module.css"

const BridgeFields = () => {
  const navigate = useNavigate()

  const [selectedType, setSelectedType] = useLocalStorage<RouteType>(
    LocalStorageKey.BRIDGE_ROUTE_TYPE,
    "default",
  )

  // form
  const { watch, setValue, handleSubmit, trigger, formState } = useBridgeForm()
  const values = watch()
  const { srcChainId, srcDenom, dstChainId, dstDenom, quantity, sender, slippagePercent } = values

  const srcChain = useSkipChain(srcChainId)
  const srcChainType = useChainType(srcChain)
  const srcAsset = useSkipAsset(srcDenom, srcChainId)
  const dstAsset = useSkipAsset(dstDenom, dstChainId)
  const srcBalance = useSkipBalance(sender, srcChainId, srcDenom)

  useEffect(() => {
    if (Number(quantity)) trigger()
  }, [srcBalance, quantity, trigger])

  // simulation
  const [debouncedQuantity, setDebouncedQuantity] = useState(quantity)
  const [isReady] = useDebounce(() => setDebouncedQuantity(quantity), 300, [quantity])

  const isOpWithdrawable = useIsOpWithdrawable()
  const routeQueryDefault = useRouteQuery(debouncedQuantity)
  const routeQueryOpWithdrawal = useRouteQuery(debouncedQuantity, {
    isOpWithdraw: true,
    disabled: !isOpWithdrawable,
  })
  const routeQuery =
    isOpWithdrawable && selectedType === "op" ? routeQueryOpWithdrawal : routeQueryDefault
  const { data, isLoading, isFetching, error, isFetched } = routeQuery
  const ready = isReady()
  const route = ready && isFetched ? data : undefined
  const isSimulating = !ready || isLoading || isFetching

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
      openModal({
        content: (
          <BridgeWarningModalContent
            warning={route.warning}
            onOk={() => {
              navigate("/bridge/preview", { route, values })
              closeModal()
            }}
            onCancel={closeModal}
          />
        ),
      })
      return
    }

    navigate("/bridge/preview", { route, values })
  })

  // disabled
  const disabledMessage = useMemo(() => {
    if (!values.sender) return "Connect wallet"
    if (!values.quantity) return "Enter amount"
    if (!values.recipient) return "Enter recipient address"
    if (formState.errors.quantity) return formState.errors.quantity.message
    const result = FormValuesSchema.safeParse(values)
    if (!result.success) return `Invalid ${result.error.issues[0].path}`
    if (!route) return "Route not found"
  }, [formState, route, values])

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

            <FormHelp.Stack>
              {isOpWithdrawable && selectedType === "op" && route && (
                <FormHelp level="info">
                  Withdraw transaction is required when using the Optimistic bridge. Status of all
                  withdrawals can be viewed on the {withdrawalStatusLink} page.
                </FormHelp>
              )}
              {isMaxAmount && (
                <FormHelp level="warning">Make sure to leave enough for fees</FormHelp>
              )}
              <FormHelp level="warning">{route?.warning?.message}</FormHelp>
              {route?.extra_warnings?.map((warning) => (
                <FormHelp level="warning" key={warning}>
                  {warning}
                </FormHelp>
              ))}
              <FormHelp level="error">{error?.message}</FormHelp>
            </FormHelp.Stack>

            <div className={styles.meta}>
              {route && formatFees(route.estimated_fees) && (
                <div className={styles.row}>
                  <span className={styles.title}>Estimated fees</span>
                  <span className={styles.description}>{formatFees(route.estimated_fees)}</span>
                </div>
              )}

              {route && formatDuration(route.estimated_route_duration_seconds) && (
                <div className={styles.row}>
                  <span className={styles.title}>Estimated route duration</span>
                  <span className={styles.description}>
                    {formatDuration(route.estimated_route_duration_seconds)}
                  </span>
                </div>
              )}

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
            </div>
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
