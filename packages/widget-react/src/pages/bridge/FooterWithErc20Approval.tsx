import { ethers } from "ethers"
import type { PropsWithChildren } from "react"
import { useMutation } from "@tanstack/react-query"
import type { TxJson } from "@skip-go/client"
import { normalizeError } from "@/data/http"
import { useGetProvider } from "@/data/signer"
import { useFindSkipChain } from "./data/chains"
import { switchEvmChain } from "./data/evm"
import Footer from "@/components/Footer"
import FormHelp from "@/components/form/FormHelp"
import Button from "@/components/Button"

const FooterWithErc20Approval = ({ tx, children }: PropsWithChildren<{ tx: TxJson }>) => {
  const getProvider = useGetProvider()
  const findSkipChain = useFindSkipChain()

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: async () => {
      try {
        if (!("evm_tx" in tx)) throw new Error("Transaction is not EVM")
        if (!tx.evm_tx.required_erc20_approvals) throw new Error("No approvals required")

        const { chain_id: chainId } = tx.evm_tx
        const provider = await getProvider()
        const signer = await provider.getSigner()
        await switchEvmChain(provider, findSkipChain(chainId))

        for (const approval of tx.evm_tx.required_erc20_approvals) {
          const { token_contract, spender, amount } = approval
          const erc20Abi = [
            "function approve(address spender, uint256 amount) external returns (bool)",
          ]
          const tokenContract = new ethers.Contract(token_contract, erc20Abi, signer)
          const response = await tokenContract.approve(spender, amount)
          await response.wait()
        }

        return true
      } catch (error) {
        throw new Error(await normalizeError(error))
      }
    },
  })

  if (
    "evm_tx" in tx &&
    tx.evm_tx.required_erc20_approvals &&
    tx.evm_tx.required_erc20_approvals.length > 0 &&
    !data
  ) {
    return (
      <Footer extra={<FormHelp level="error">{error?.message}</FormHelp>}>
        <Button.White onClick={() => mutate()} loading={isPending && "Approving tokens..."}>
          Approve tokens
        </Button.White>
      </Footer>
    )
  }

  return children
}

export default FooterWithErc20Approval
