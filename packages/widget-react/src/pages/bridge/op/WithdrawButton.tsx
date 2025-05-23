import { fromBase64, toBase64 } from "@cosmjs/encoding"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MsgFinalizeTokenWithdrawal } from "@initia/opinit.proto/opinit/ophost/v1/tx"
import { IconCheckCircleFilled } from "@initia/icons-react"
import { useInitiaAddress, useInitiaWidget } from "@/public/data/hooks"
import { useLayer1 } from "@/data/chains"
import Loader from "@/components/Loader"
import type { WithdrawalTx } from "./data"
import { computeWithdrawalHash, opQueryKeys, useOutputResponse, useWithdrawalClaimed } from "./data"
import styles from "./WithdrawButton.module.css"

interface Props {
  withdrawalTx: WithdrawalTx
}

const WithdrawButton = ({ withdrawalTx }: Props) => {
  const {
    bridge_id,
    sequence,
    amount,
    output_index,
    withdrawal_proofs,
    storage_root,
    from,
    to,
    version,
  } = withdrawalTx

  const layer1 = useLayer1()
  const address = useInitiaAddress()
  const { requestTxBlock } = useInitiaWidget()
  const outputResponse = useOutputResponse(withdrawalTx)
  const withdrawalHash = toBase64(computeWithdrawalHash(withdrawalTx))
  const claimed = useWithdrawalClaimed(withdrawalTx, withdrawalHash)

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!outputResponse) throw new Error("Output not found")
      const { last_block_hash } = outputResponse

      return requestTxBlock({
        chainId: layer1.chain_id,
        messages: [
          {
            typeUrl: "/opinit.ophost.v1.MsgFinalizeTokenWithdrawal",
            value: MsgFinalizeTokenWithdrawal.fromPartial({
              sender: address,
              bridgeId: BigInt(bridge_id),
              outputIndex: BigInt(output_index),
              withdrawalProofs: withdrawal_proofs.map(fromBase64),
              from: from,
              to: to,
              sequence: BigInt(sequence),
              amount: amount,
              version: fromBase64(version),
              storageRoot: fromBase64(storage_root),
              lastBlockHash: fromBase64(last_block_hash),
            }),
          },
        ],
        internal: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: opQueryKeys.withdrawalClaimed(bridge_id, withdrawalHash).queryKey,
      })
    },
  })

  if (claimed) {
    return (
      <div className={styles.claimed}>
        <div className={styles.icon}>
          <IconCheckCircleFilled size={18} />
        </div>
        <span>Success</span>
      </div>
    )
  }

  return (
    <button className={styles.withdraw} onClick={() => mutate()} disabled={isPending}>
      {isPending ? <Loader /> : "Withdraw"}
    </button>
  )
}

export default WithdrawButton
