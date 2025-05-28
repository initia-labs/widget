import ky from "ky"
import clsx from "clsx"
import { Address } from "@/public/utils"
import { useAminoTypes } from "@/data/signer"
import type { AminoMsg } from "@cosmjs/amino"
import { useFormContext } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useLocationState } from "@/lib/router"
import { useInitiaWidget } from "@/public/data/hooks"
import { useConfig } from "@/data/config"
import { useChain, useLayer1 } from "@/data/chains"
import { useAutoFocus } from "@/components/form/hooks"
import ModalTrigger from "@/components/ModalTrigger"
import RecipientInput from "@/components/form/RecipientInput"
import Button from "@/components/Button"
import Image from "@/components/Image"
import FormHelp from "@/components/form/FormHelp"
import Footer from "@/components/Footer"
import AddedChainList from "../../components/AddedChainList"
import type { ChainCollectionNftCollectionState } from "../../tabs/nft/queries"
import NftThumbnail from "../../tabs/nft/NftThumbnail"
import { createNftTransferParams } from "./tx"
import type { FormValues } from "./SendNft"
import styles from "./SendNftFields.module.css"

const SendNftFields = () => {
  const { chain: srcChain, collection, nft } = useLocationState<ChainCollectionNftCollectionState>()

  const { routerApiUrl } = useConfig()
  const aminoTypes = useAminoTypes()
  const layer1 = useLayer1()
  const { address, initiaAddress, requestTxSync } = useInitiaWidget()

  const { watch, setValue, handleSubmit, formState } = useFormContext<FormValues>()
  const { dstChainId } = watch()
  const dstChain = useChain(dstChainId)

  const { mutate, isPending, error } = useMutation({
    mutationFn: async ({ recipient, dstChainId }: FormValues) => {
      const params = Object.assign(
        {
          from_address: initiaAddress,
          from_chain_id: srcChain.chainId,
          to_address: Address.toBech32(recipient),
          to_chain_id: dstChainId,
          collection_address: collection.object_addr,
          token_ids: [nft.token_id],
          object_addresses: [nft.object_addr],
        },
        srcChain.chainId !== dstChainId &&
          (await createNftTransferParams({
            collection,
            nft,
            srcChain,
            intermediaryChain: layer1,
          })),
      )

      const { msgs } = await ky
        .create({ prefixUrl: routerApiUrl })
        .post("nft", { json: params })
        .json<{ msgs: AminoMsg[] }>()

      const messages = msgs.map((msg) => aminoTypes.fromAmino(msg))

      await requestTxSync({ messages, chainId: srcChain.chainId, internal: "/nfts" })
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))}>
      <header className={styles.header}>
        {nft.image && <NftThumbnail src={nft.image} size={80} />}
        <div className={styles.name}>
          <div className={styles.collection}>{collection.name}</div>
          <div className={styles.nft}>{nft.name}</div>
        </div>
      </header>

      <div className={styles.fields}>
        <div>
          <div className="label">Destination rollup</div>

          <ModalTrigger
            title="Destination rollup"
            content={(close) => (
              <AddedChainList
                onSelect={(chainId) => {
                  setValue("dstChainId", chainId)
                  close()
                }}
              />
            )}
            className={clsx("input", styles.chain)}
          >
            <Image src={dstChain.logoUrl} width={20} height={20} />
            <span>{dstChain.name}</span>
          </ModalTrigger>
        </div>

        <RecipientInput myAddress={address} ref={useAutoFocus()} />

        <FormHelp.Stack>
          {error && <FormHelp level="error">{error.message}</FormHelp>}
        </FormHelp.Stack>
      </div>

      <Footer>
        <Button.White loading={isPending} disabled={!formState.isValid}>
          Confirm
        </Button.White>
      </Footer>
    </form>
  )
}

export default SendNftFields
