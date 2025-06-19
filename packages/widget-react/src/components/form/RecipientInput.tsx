import type { Ref } from "react"
import { useState, useEffect } from "react"
import { mergeRefs } from "react-merge-refs"
import { useFormContext } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { IconCloseCircleFilled } from "@initia/icons-react"
import { AddressUtils } from "@/public/utils"
import { STALE_TIMES } from "@/data/http"
import { accountQueryKeys, useUsernameClient } from "@/data/account"
import Footer from "../Footer"
import Button from "../Button"
import { useAutoFocus } from "./hooks"
import FormHelp from "./FormHelp"
import InputHelp from "./InputHelp"
import styles from "./RecipientInput.module.css"

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

  const { getValues, setValue, formState } = useFormContext<{ recipient: string }>()
  const initialValue = getValues("recipient")
  const [inputValue, setInputValue] = useState(initialValue)
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputValue(text.trim())
    } catch {
      // ignore clipboard read errors
    }
  }

  // onChange: update form value on every valid input change
  useEffect(() => {
    if (mode !== "onChange") return
    if (!inputValue) return
    setValue("recipient", usernameAddress ?? inputValue, { shouldValidate: true })
  }, [inputValue, mode, setValue, usernameAddress])

  // onSubmit: update form value when button clicked
  const handleApply = () => {
    if (isLoading || error) return
    setValue("recipient", resolvedAddress, { shouldValidate: true })
    onApply?.()
  }

  const renderUsernameQueryResult = () => {
    if (isLoading) {
      return <InputHelp level="loading">Resolving username...</InputHelp>
    }
    if (error) {
      return <InputHelp level="error">{error.message}</InputHelp>
    }
    if (usernameAddress) {
      return (
        <InputHelp level="success" className="mono">
          {usernameAddress}
        </InputHelp>
      )
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

        <Button.Small type="button" onClick={handlePaste}>
          Paste
        </Button.Small>
      </label>

      <div className={styles.wrapper}>
        <input
          id="recipient"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.trim())}
          placeholder="Address or username"
          autoComplete="off"
          ref={mode === "onSubmit" ? mergeRefs([ref, autoFocusRef]) : ref}
        />

        {!!inputValue && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => setInputValue("")}
            aria-label="Clear recipient"
          >
            <IconCloseCircleFilled size={16} />
          </button>
        )}
      </div>

      {renderUsernameQueryResult()}
      {isMyAddress && <InputHelp>This is my address</InputHelp>}

      {mode === "onSubmit" && (
        <Footer
          extra={
            (!myAddress || (!!resolvedAddress && !isMyAddress)) && (
              <FormHelp level="info">
                Do not enter an exchange address. Tokens lost during the transfer will not be
                retrievable.
              </FormHelp>
            )
          }
        >
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
