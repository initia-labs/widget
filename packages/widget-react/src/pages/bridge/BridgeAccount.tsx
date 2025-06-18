import clsx from "clsx"
import { IconChevronRight, IconCloseCircleFilled, IconEdit, IconWallet } from "@initia/icons-react"
import { AddressUtils, truncate } from "@/public/utils"
import Image from "@/components/Image"
import ModalTrigger from "@/components/ModalTrigger"
import Scrollable from "@/components/Scrollable"
import List from "@/components/List"
import RecipientInput from "@/components/form/RecipientInput"
import { useGetDefaultAddress, useValidateAddress } from "./data/address"
import { useBridgeForm } from "./data/form"
import { useCosmosWallets } from "./data/cosmos"
import styles from "./BridgeAccount.module.css"
import { useChainType, useSkipChain } from "./data/chains"

interface Props {
  type?: "src" | "dst"
}

const BridgeAccount = ({ type }: Props) => {
  const { watch, setValue } = useBridgeForm()
  const { srcChainId, dstChainId, cosmosWalletName } = watch()
  const addressKey = type === "src" ? "sender" : "recipient"
  const address = watch(addressKey)
  const dstChainType = useChainType(useSkipChain(dstChainId))

  const { list, find } = useCosmosWallets()
  const connected = find(cosmosWalletName)
  const getDefaultRecipientAddress = useGetDefaultAddress()
  const validateRecipientAddress = useValidateAddress()

  const myDstAddress = getDefaultRecipientAddress(dstChainId)
  const isMyDstAddress = AddressUtils.equals(address, myDstAddress)

  const renderContent = () => {
    if (dstChainType !== "cosmos" && type === "dst") {
      if (isMyDstAddress) {
        return <IconWallet size={14} />
      } else {
        return (
          <>
            <span>{truncate(address)}</span>
            <button className={styles.reset} onClick={() => setValue("recipient", myDstAddress)}>
              <IconCloseCircleFilled size={14} />
            </button>
          </>
        )
      }
    }

    return (
      <>
        {type === "src" && connected && <Image src={connected.image} width={18} height={18} />}
        <span>{address ? truncate(address) : "Recipient"}</span>
        {type === "dst" && <IconEdit size={14} />}
      </>
    )
  }

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
            renderContent()
          )}
        </ModalTrigger>
      )
    }

    case "dst": {
      if (dstChainType !== "cosmos" && !isMyDstAddress) {
        return <div className={styles.account}>{renderContent()}</div>
      }

      return (
        <div className={styles.wrapper}>
          <ModalTrigger
            title="Recipient"
            content={(close) => (
              <Scrollable>
                <RecipientInput
                  mode="onSubmit"
                  myAddress={myDstAddress}
                  validate={(address) => validateRecipientAddress(address, dstChainId)}
                  onApply={close}
                />
              </Scrollable>
            )}
            className={styles.account}
          >
            {renderContent()}
          </ModalTrigger>
        </div>
      )
    }
  }
}

export default BridgeAccount
