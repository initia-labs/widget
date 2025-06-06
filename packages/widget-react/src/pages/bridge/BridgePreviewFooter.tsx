import type { TxJson } from "@skip-go/client"
import Button from "@/components/Button"
import Footer from "@/components/Footer"
import { useBridgeTx } from "./data/tx"
import FooterWithError from "./FooterWithError"

interface Props {
  tx: TxJson
}

const BridgePreviewFooter = ({ tx }: Props) => {
  const { mutate, isPending, error } = useBridgeTx(tx)

  if (error) {
    return <FooterWithError error={error} />
  }

  return (
    <Footer>
      <Button.White onClick={() => mutate()} loading={isPending && "Signing transaction..."}>
        Confirm
      </Button.White>
    </Footer>
  )
}

export default BridgePreviewFooter
