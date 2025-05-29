import BigNumber from "bignumber.js"

export interface FormatNumberOptions {
  dp?: number
}

export function formatNumber(value: BigNumber.Value, options: FormatNumberOptions = {}) {
  const number = BigNumber(value)
  if (number.isZero() || number.isNaN()) return "0"
  const { dp = 2 } = options
  const numberFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })
  return numberFormatter.format(number.decimalPlaces(dp, BigNumber.ROUND_DOWN).toNumber())
}

/* amount */
export interface FormatAmountOptions extends FormatNumberOptions {
  decimals?: number
}

export function formatAmount(value?: BigNumber.Value, options: FormatAmountOptions = {}) {
  if (!value) return "0"
  const number = BigNumber(value)
  if (number.isZero() || number.isNaN()) return "0"
  const { decimals = 0, dp = decimals > 6 ? 6 : decimals } = options
  const quantity = number.div(new BigNumber(10).pow(decimals))
  return formatNumber(quantity, { dp })
}

export function toAmount(value?: BigNumber.Value, decimals = 6) {
  if (!value || BigNumber(value).isNaN()) return "0"
  return new BigNumber(value).times(new BigNumber(10).pow(decimals)).integerValue().toString(10)
}

export function toQuantity(value?: BigNumber.Value, decimals = 6) {
  if (!value || BigNumber(value).isNaN()) return "0"
  return new BigNumber(value)
    .integerValue()
    .div(new BigNumber(10).pow(decimals))
    .toFixed(6, BigNumber.ROUND_DOWN)
}

/* percent */
export function formatPercent(value?: BigNumber.Value, fixed?: number) {
  if (!value || BigNumber(value).isNaN()) return "0%"
  const n = new BigNumber(value).times(100)
  if (typeof fixed === "number") return n.toFixed(fixed) + "%"
  return (n.gte(100) ? n.toFixed(0) : n.toFixed(2)) + "%"
}
