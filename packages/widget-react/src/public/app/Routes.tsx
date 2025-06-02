import { usePath } from "@/lib/router"
import Status from "@/components/Status"
import Home from "@/pages/wallet/tabs/Home"
import Send from "@/pages/wallet/txs/send/Send"
import CollectionDetails from "@/pages/wallet/tabs/nft/CollectionDetails"
import NftDetails from "@/pages/wallet/tabs/nft/NftDetails"
import SendNft from "@/pages/wallet/txs/send-nft/SendNft"
import ManageChains from "@/pages/wallet/tabs/ManageChains"
import BridgeForm from "@/pages/bridge/BridgeForm"
import Withdrawals from "@/pages/bridge/op/Withdrawals"
import BridgePreview from "@/pages/bridge/BridgePreview"
import BridgeHistory from "@/pages/bridge/BridgeHistory"
import TxRequest from "@/pages/tx/TxRequest"
import { useAddress } from "../data/hooks"

const Routes = () => {
  const path = usePath()
  const address = useAddress()

  switch (path) {
    case "/bridge":
      return <BridgeForm />
    case "/bridge/history":
      return <BridgeHistory />
  }

  if (!address) {
    return <Status error>Wallet not connected</Status>
  }

  switch (path) {
    case "/":
    case "/nfts":
    case "/activity":
      return <Home />
    case "/send":
      return <Send />
    case "/collection":
      return <CollectionDetails />
    case "/nft":
      return <NftDetails />
    case "/nft/send":
      return <SendNft />
    case "/rollups":
      return <ManageChains />
    case "/bridge/preview":
      return <BridgePreview />
    case "/op/withdrawals":
      return <Withdrawals />
    case "/tx":
      return <TxRequest />
    case "/blank":
      return null
  }
}

export default Routes
