import type { Ref } from "react"
import { useState, useEffect } from "react"
import clsx from "clsx"
import { mergeRefs } from "react-merge-refs"
import { useFormContext } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { IconCheck } from "@initia/icons-react"
import { AddressUtils } from "@/public/utils"
import { STALE_TIMES } from "@/data/http"
import { accountQueryKeys, useUsernameClient } from "@/data/account"
import Footer from "../Footer"
import Button from "../Button"
import { useAutoFocus } from "./hooks"
import InputHelp from "./InputHelp"
import styles from "./RecipientInput.module.css"
import FormHelp from "./FormHelp"

interface Props {
  mode?: "onChange" | "onSubmit" // onSubmit: for Bridge
  myAddress?: string
  validate?: (address: string) => boolean
  onApply?: () => void
  ref?: Ref<HTMLInputElement>
}

const RecipientInput = (props: Props) => {
  const { mode = "onChange", myAddress, validate = AddressUtils.validate, onApply, ref } = props
  const autoFocusRef = useAutoFocus()

  const { getValues, setValue, formState } = useFormContext<{
    recipient: string
    recipientType?: string
  }>()
  const initialValue = mode === "onChange" ? getValues("recipient") : ""
  const [inputValue, setInputValue] = useState<string>(initialValue)
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
  const isMyAddress = myAddress && AddressUtils.equals(resolvedAddress, myAddress)

  // onChange: update form value on every valid input change
  useEffect(() => {
    if (mode !== "onChange") return
    if (!inputValue) return
    setValue("recipient", usernameAddress ?? inputValue, { shouldValidate: true })
  }, [inputValue, mode, setValue, usernameAddress])

  // onSubmit: update form value when button clicked
  const handleApply = () => {
    if (isLoading || error) return
    const recipientType = isMyAddress ? "auto" : "manual"
    setValue("recipientType", recipientType, { shouldValidate: true })
    setValue("recipient", resolvedAddress, { shouldValidate: true })
    onApply?.()
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
    if (mode === "onSubmit" && inputValue && !resolvedAddress) {
      return <InputHelp level="error">Invalid address</InputHelp>
    }
    if (mode === "onChange") {
      return <InputHelp level="error">{formState.errors.recipient?.message}</InputHelp>
    }
  }

  return (
    <div>
      <label htmlFor="recipient" className={styles.label}>
        <span>Recipient</span>

        {myAddress && (
          <Button.Small
            type="button"
            onClick={() => setInputValue(myAddress)}
            className={clsx(styles.myAddress, { [styles.active]: isMyAddress })}
          >
            <IconCheck size={14} />
            {isMyAddress ? "This is my address" : "Enter my address"}
          </Button.Small>
        )}
      </label>

      <input
        id="recipient"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.trim())}
        placeholder="Address or username"
        autoComplete="off"
        ref={mode === "onSubmit" ? mergeRefs([ref, autoFocusRef]) : ref}
      />

      {renderResult()}

      {!isMyAddress && !!resolvedAddress && (
        <div className={styles.warning}>
          <FormHelp level="warning">
            You've entered a custom address. Do not enter an exchange address. Tokens lost during
            the transfer will not be retrievable.
          </FormHelp>
        </div>
      )}

      {mode === "onSubmit" && (
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
