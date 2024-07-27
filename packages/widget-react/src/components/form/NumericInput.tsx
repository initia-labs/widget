import type { InputHTMLAttributes } from "react"
import { mergeRefs } from "react-merge-refs"
import type { Control, FieldValues, Path } from "react-hook-form"
import { Controller } from "react-hook-form"
import { useAutoFocus } from "./hooks"

function sanitizeNumericInput(value: string, maxLength: number): string {
  const cleaned = value.replace(/[^0-9.]/g, "")
  const [int, ...dec] = cleaned.split(".")
  return dec.length === 0 ? int : `${int}.${dec.join("").slice(0, maxLength)}`
}

interface Props<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  control: Control<T>
  dp?: number
}

function NumericInput<T extends FieldValues>({ name, control, dp = 6, ...props }: Props<T>) {
  const autoFocusRef = useAutoFocus()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input
          {...props}
          {...field}
          onChange={(e) => field.onChange(sanitizeNumericInput(e.target.value, dp))}
          placeholder="0"
          inputMode="decimal"
          autoComplete="off"
          ref={mergeRefs([field.ref, autoFocusRef])}
        />
      )}
    />
  )
}

export default NumericInput
