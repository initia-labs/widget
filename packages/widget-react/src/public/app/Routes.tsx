import { useEffect } from "react"
import { useTransition, animated } from "@react-spring/web"
import { useNavigate, usePath, usePreviousPath } from "@/lib/router"
import { useAddress } from "../data/hooks"
import Connect from "@/pages/connect/Connect"
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

const routes = [
  { path: "/connect", component: <Connect /> },
  { path: "/", component: <Home /> },
  { path: "/send", component: <Send /> },
  { path: "/collection", component: <CollectionDetails /> },
  { path: "/nft", component: <NftDetails /> },
  { path: "/nft/send", component: <SendNft /> },
  { path: "/rollups", component: <ManageChains /> },
  { path: "/bridge", component: <BridgeForm /> },
  { path: "/bridge/preview", component: <BridgePreview /> },
  { path: "/bridge/history", component: <BridgeHistory /> },
  { path: "/op/withdrawals", component: <Withdrawals /> },
  { path: "/tx", component: <TxRequest /> },
]

const Routes = () => {
  const rawPath = usePath()
  const rawPrevPath = usePreviousPath()
  const navigate = useNavigate()
  const address = useAddress()

  const path = ["/nfts", "/activity"].includes(rawPath) ? "/" : rawPath
  const prevPath = ["/nfts", "/activity"].includes(rawPrevPath || "") ? "/" : rawPrevPath

  // whenever address changes, navigate to the appropriate path
  useEffect(() => {
    if (path.startsWith("/bridge/")) {
      navigate("/bridge")
    }
    if (path === "/collection" || path.startsWith("/nft")) {
      navigate("/nfts")
    }
    // Run only on address changes, preventing navigation from triggering on path updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  // Compute transition direction
  const currentIndex = routes.findIndex((r) => r.path === path)
  const prevIndex = routes.findIndex((r) => r.path === prevPath)
  const direction = currentIndex >= prevIndex ? 1 : -1

  const transitions = useTransition(path, {
    from: { opacity: 0, transform: `translateX(${direction * 100}%)` },
    enter: { opacity: 1, transform: "translateX(0%)" },
    leave: { opacity: 0, transform: `translateX(${direction * -100}%)` },
    config: { tension: 250, friction: 30 },
    skipAnimation: !prevPath,
  })

  if (path === "/connect" && !address) return <Connect />

  // FIXME: do we need to block all routes when address is not connected?
  if (!address) return null

  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      {transitions((style, animatedPath) => {
        const route = routes.find((r) => r.path === animatedPath)
        if (!route) return null
        return (
          <animated.div
            key={animatedPath}
            style={{
              ...style,
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            {route.component}
          </animated.div>
        )
      })}
    </div>
  )
}

export default Routes
