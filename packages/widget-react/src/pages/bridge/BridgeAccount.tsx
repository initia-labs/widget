import clsx from "clsx"
import { IconChevronRight, IconEdit } from "@initia/icons-react"
import { truncate } from "@/public/utils"
import Image from "@/components/Image"
import ModalTrigger from "@/components/ModalTrigger"
import Scrollable from "@/components/Scrollable"
import List from "@/components/List"
import RecipientInput from "@/components/form/RecipientInput"
import InputHelp from "@/components/form/InputHelp"
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
        <ModalTrigger
          title="Recipient address"
          content={(close) => (
            <Scrollable>
              <InputHelp level="warning" className={styles.warning}>
                Do not enter an exchange address. Tokens lost during the transfer will not be
                retrievable.
              </InputHelp>
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
      )
    }
  }
}

export default BridgeAccount
