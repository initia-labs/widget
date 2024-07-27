import type { Ref } from "react"
import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Address } from "@/public/utils"
import { STALE_TIMES } from "@/data/http"
import { accountQueryKeys, useUsernameClient } from "@/data/account"
import Footer from "../Footer"
import Button from "../Button"
import InputHelp from "./InputHelp"
import styles from "./RecipientInput.module.css"

type Mode = "auto" | "manual"

interface Props {
  mode?: Mode
  myAddress: string
  validate?: (address: string) => boolean
  onApply?: () => void
  ref?: Ref<HTMLInputElement>
}

const RecipientInput = (props: Props) => {
  const { mode = "auto", myAddress, validate = Address.validate, onApply, ref } = props
  const { getValues, setValue, formState } = useFormContext<{ recipient: string }>()
  const [inputValue, setInputValue] = useState<string>(getValues("recipient"))
  const client = useUsernameClient()

  const {
    data: usernameAddress,
    isLoading,
    error,
  } = useQuery({
    queryKey: accountQueryKeys.address(client.restUrl, inputValue).queryKey,
    queryFn: () => client.getAddress(inputValue),
    staleTime: STALE_TIMES.MINUTE,
    enabled: client.validateUsername(inputValue),
  })

  const resolvedAddress = usernameAddress ?? (validate(inputValue) ? inputValue : "")

  // Auto-mode: update form value on every valid input change
  useEffect(() => {
    if (mode !== "auto") return
    if (!inputValue) return
    setValue("recipient", usernameAddress ?? inputValue, { shouldValidate: true })
  }, [inputValue, mode, setValue, usernameAddress])

  // Manual-mode: update form value when button clicked
  const handleApply = () => {
    if (!isLoading && !error) {
      setValue("recipient", resolvedAddress, { shouldValidate: true })
      onApply?.()
    }
  }

  const renderResult = () => {
    if (isLoading) {
      return <InputHelp level="loading">Resolving username...</InputHelp>
    }
    if (error) {
      return <InputHelp level="error">{error.message}</InputHelp>
    }
    if (usernameAddress) {
      return <InputHelp level="success">{usernameAddress}</InputHelp>
    }
    if (mode === "manual" && inputValue && !resolvedAddress) {
      return <InputHelp level="error">Invalid address</InputHelp>
    }
    if (mode === "auto") {
      return <InputHelp level="error">{formState.errors.recipient?.message}</InputHelp>
    }
  }

  return (
    <div>
      <label htmlFor="recipient" className={styles.label}>
        <span>Recipient address</span>

        <Button.Small type="button" onClick={() => setInputValue(myAddress)}>
          My address
        </Button.Small>
      </label>

      <input
        id="recipient"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.trim())}
        placeholder="Address or username"
        autoComplete="off"
        ref={ref}
      />

      {renderResult()}

      {mode === "manual" && (
        <Footer>
          <Button.White
            type="button"
            onClick={handleApply}
            disabled={isLoading || !!error || !resolvedAddress}
          >
            Apply
          </Button.White>
        </Footer>
      )}
    </div>
  )
}

export default RecipientInput
