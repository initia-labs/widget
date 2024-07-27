"use client"

import { useConnectWallet, useWallets } from "@privy-io/react-auth"
import { truncate, useInitiaWidget } from "@initia/widget-react"

export default function Home() {
  const { connectWallet } = useConnectWallet()
  const { ready } = useWallets()
  const { address, username, openWallet } = useInitiaWidget()

  if (!address) {
    return (
      <button onClick={connectWallet} disabled={!ready}>
        {ready ? "Connect" : "Loading..."}
      </button>
    )
  }

  return <button onClick={openWallet}>{truncate(username ?? address)}</button>
}
