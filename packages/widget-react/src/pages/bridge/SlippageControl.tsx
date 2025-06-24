import Button from "@/components/Button"
import Footer from "@/components/Footer"
import InputHelp from "@/components/form/InputHelp"
import NumericInput from "@/components/form/NumericInput"
import PlainModalContent from "@/components/PlainModalContent"
import Scrollable from "@/components/Scrollable"
import { useModal } from "@/public/app/ModalContext"
import { IconWarningFilled } from "@initia/icons-react"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useBridgeForm } from "./data/form"
import styles from "./SlippageControl.module.css"

const PRESETS = ["0.1", "0.5", "1.0"]

interface FormValues {
  value: string
}

const SlippageControl = ({ afterConfirm }: { afterConfirm: () => void }) => {
  const bridgeForm = useBridgeForm()
  const defaultValue = bridgeForm.getValues("slippagePercent")

  const [activePreset, setActivePreset] = useState<number | null>(null)
  const { control, watch, getValues, setValue } = useForm<FormValues>({
    defaultValues: { value: defaultValue },
  })

  const value = watch("value")

  // Initialize active preset if default matches one
  useEffect(() => {
    const index = PRESETS.findIndex((preset) => preset === defaultValue)
    setActivePreset(index >= 0 ? index : null)
  }, [defaultValue])

  const handlePresetClick = (preset: string, index: number) => {
    setValue("value", preset)
    setActivePreset(index)
  }

  const handleInputFocus = () => {
    setActivePreset(null)
  }

  const message = useMemo(() => {
    if (Number(value) > 50) {
      return { type: "error" as const, text: "Slippage must be less than 50%" }
    }

    if (Number(value) > 5) {
      return { type: "warning" as const, text: "Your transaction may be frontrun" }
    }

    if (Number(value) < 0.5) {
      return { type: "warning" as const, text: "Your transaction may fail" }
    }

    return null
  }, [value])

  const isError = message?.type === "error"

  const onConfirm = ({ value }: FormValues) => {
    bridgeForm.setValue("slippagePercent", value)
    afterConfirm()
  }

  const { openModal, closeModal } = useModal()
  const openHighImpactModal = () =>
    openModal({
      content: (
        <PlainModalContent
          type="warning"
          icon={<IconWarningFilled size={40} />}
          title="High impact"
          primaryButton={{ label: "Cancel", onClick: closeModal }}
          secondaryButton={{
            label: "Proceed anyway",
            onClick: () => {
              closeModal()
              onConfirm(getValues())
            },
          }}
        >
          <p className={styles.warning}>
            This will result in a price impact of over 5%. You will receive significant less than
            expected amount.
          </p>
        </PlainModalContent>
      ),
    })

  return (
    <Scrollable>
      <p className={styles.description}>
        Slippage is how much price movement you can tolerate between the time you send out a
        transaction and the time it's executed.
      </p>

      <div className={styles.presets}>
        {PRESETS.map((preset, index) => (
          <button
            type="button"
            className={clsx(styles.preset, { [styles.active]: activePreset === index })}
            onClick={() => handlePresetClick(preset, index)}
            key={preset}
          >
            {preset}%
          </button>
        ))}
      </div>

      <div className={styles.input}>
        <NumericInput name="value" control={control} dp={2} onFocus={handleInputFocus} />
        <span className={styles.percent}>%</span>
      </div>

      {message && <InputHelp level={message.type}>{message.text}</InputHelp>}

      <Footer>
        <Button.White
          type="button"
          onClick={() => {
            if (Number(value) > 5) openHighImpactModal()
            else onConfirm(getValues())
          }}
          disabled={isError}
        >
          Confirm
        </Button.White>
      </Footer>
    </Scrollable>
  )
}

export default SlippageControl
