import clsx from "clsx"
import BigNumber from "bignumber.js"
import { useFormContext } from "react-hook-form"
import NumericInput from "./NumericInput"
import styles from "./QuantityInput.module.css"

const QuantityInputReadOnly = ({ children }: { children: string }) => {
  return (
    <p className={clsx(styles.input, { [styles.placeholder]: BigNumber(children).isZero() })}>
      {children}
    </p>
  )
}

const QuantityInput = () => {
  const { control, formState } = useFormContext()
  return (
    <NumericInput
      name="quantity"
      control={control}
      className={styles.input}
      error={!!formState.errors.quantity?.message}
    />
  )
}

QuantityInput.ReadOnly = QuantityInputReadOnly

export default QuantityInput
