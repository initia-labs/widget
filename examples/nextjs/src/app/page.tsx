"use client"

import { truncate, useInterwovenKit } from "@initia/widget-react"

export default function Home() {
  const { address, username, openConnect, openWallet } = useInterwovenKit()

  if (!address) {
    return <button onClick={openConnect}>Connect</button>
  }

  return <button onClick={openWallet}>{truncate(username ?? address)}</button>
}
