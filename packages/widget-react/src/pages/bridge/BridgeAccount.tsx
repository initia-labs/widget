import clsx from "clsx"
import { IconChevronRight, IconEdit, IconWarningFilled } from "@initia/icons-react"
import { AddressUtils, truncate } from "@/public/utils"
import Image from "@/components/Image"
import ModalTrigger from "@/components/ModalTrigger"
import Scrollable from "@/components/Scrollable"
import List from "@/components/List"
import RecipientInput from "@/components/form/RecipientInput"
import WidgetTooltip from "@/components/WidgetTooltip"
import { useGetDefaultAddress, useValidateAddress } from "./data/address"
import { useBridgeForm } from "./data/form"
import { useCosmosWallets } from "./data/cosmos"
import styles from "./BridgeAccount.module.css"

interface Props {
  type?: "src" | "dst"
}

const BridgeAccount = ({ type }: Props) => {
  const { watch, setValue } = useBridgeForm()
  const { srcChainId, dstChainId, cosmosWalletName } = watch()
  const addressKey = type === "src" ? "sender" : "recipient"
  const address = watch(addressKey)

  const { list, find } = useCosmosWallets()
  const connected = find(cosmosWalletName)
  const getDefaultRecipientAddress = useGetDefaultAddress()
  const validateRecipientAddress = useValidateAddress()

  const isDstMyAddress = AddressUtils.equals(address, getDefaultRecipientAddress(dstChainId))

  const content = (
    <>
      {type === "src" && connected && <Image src={connected.image} width={18} height={18} />}
      <span>{address ? truncate(address) : "Recipient"}</span>
      {type === "dst" && <IconEdit size={14} />}
    </>
  )

  switch (type) {
    case "src": {
      return (
        <ModalTrigger
          title="Connect wallet"
          content={(close) => (
            <List
              onSelect={async (item) => {
                const provider = item.getProvider()
                if (!provider) return window.open(item.fallbackUrl, "_blank")
                const offlineSigner = provider.getOfflineSigner(srcChainId)
                const [{ address }] = await offlineSigner.getAccounts()
                setValue("sender", address)
                setValue("cosmosWalletName", item.name)
                close()
              }}
              list={list}
              getImage={(item) => item.image}
              getName={(item) => item.name}
              getKey={(item) => item.name}
            />
          )}
          className={clsx(styles.account, { [styles.white]: !address })}
        >
          {!address ? (
            <>
              <span>Connect wallet</span>
              <IconChevronRight size={14} />
            </>
          ) : (
            content
          )}
        </ModalTrigger>
      )
    }

    case "dst": {
      return (
        <div className={styles.container}>
          {!isDstMyAddress && (
            <WidgetTooltip label="This is not your address. Make sure it's correct.">
              <IconWarningFilled size={14} className={styles.warningIcon} />
            </WidgetTooltip>
          )}

          <ModalTrigger
            title="Recipient"
            content={(close) => (
              <Scrollable>
                <RecipientInput
                  mode="onSubmit"
                  myAddress={getDefaultRecipientAddress(dstChainId)}
                  validate={(address) => validateRecipientAddress(address, dstChainId)}
                  onApply={close}
                />
              </Scrollable>
            )}
            className={styles.account}
          >
            {content}
          </ModalTrigger>
        </div>
      )
    }
  }
}

export default BridgeAccount
