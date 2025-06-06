# Migrating from v1 to v2

This guide walks you through the steps to migrate from **@initia/react-wallet-widget** (v1) to **@initia/widget-react** (v2).

## 1. Package & Import Changes

### Product Name Change

The package name has changed:

```diff
- pnpm add @initia/react-wallet-widget
+ pnpm add @initia/widget-react
```

All imports from `@initia/react-wallet-widget` should now come from `@initia/widget-react`.

### Provider Setup

You must install a wallet connector to inject a wallet into the app.
This library also uses [@tanstack/react-query](https://tanstack.com/query/latest) internally, so you need to install it as well:

```bash
pnpm add @tanstack/react-query
```

⚠️ Refer to the examples below.

- **Vite**: [examples/vite/src/Providers.tsx](https://github.com/initia-labs/widget/blob/main/examples/vite/src/Providers.tsx)
- **Next.js**: [examples/nextjs/src/app/providers.tsx](https://github.com/initia-labs/widget/blob/main/examples/nextjs/src/app/providers.tsx)

## 2. SSR Support

You no longer need to import any SSR helpers:

- Remove imports from `@initia/react-wallet-widget/ssr`.
- No CDN scripts or `swcMinify: false` required.

## 3. Provider API Changes

### Renamed Props on `<InitiaWidgetProvider />`

```diff
- <WalletWidgetProvider chainId="interwoven-1" />
+ <InitiaWidgetProvider defaultChainId="interwoven-1" />
```

```diff
- <WalletWidgetProvider customLayer={chain} />
+ <InitiaWidgetProvider customChain={chain} />
```

### Moving Bridge Defaults into `openBridge()`

Previously you passed defaults via props on the provider:

```tsx
// v1
import { createRoot } from "react-dom/client"

createRoot(document.getElementById("root")).render(
  <WalletWidgetProvider
    bridgeOptions={{ defaultDstChainId: "interwoven-1", defaultDstAssetDenom: "uinit" }}
  />,
)
```

Now you pass them when opening the bridge:

```tsx
// v2
import { InitiaWidgetProvider, useInitiaWidget } from "@initia/widget-react"

const App = () => {
  const { openBridge } = useInitiaWidget()

  return (
    <button onClick={() => openBridge({ dstChainId: "interwoven-1", dstDenom: "uinit" })}>
      Bridge
    </button>
  )
}
```

### Removed Props

These props are no longer supported on `<InitiaWidgetProvider />`:

```diff
- <WalletWidgetProvider additionalWallets />
- <WalletWidgetProvider filterWallet />
```

## 4. Core Hooks & Methods

### Wallet Connection UI

```tsx
// v1
import { truncate } from "@initia/utils"
import { useWallet } from "@initia/react-wallet-widget"

const App = () => {
  const { address, onboard, view, bridge, isLoading } = useWallet()

  if (!address) {
    return (
      <button onClick={onboard} disabled={isLoading}>
        {isLoading ? "Loading..." : "Connect"}
      </button>
    )
  }

  return (
    <>
      <button onClick={bridge}>Bridge</button>
      <button onClick={view}>{truncate(address)}</button>
    </>
  )
}
```

```tsx
// v2 (Initia Widget + Privy)
import { truncate } from "@initia/widget-react"
import { useConnectWallet, useWallets } from "@privy-io/react-auth"
import { InitiaWidgetProvider, useInitiaWidget } from "@initia/widget-react"

const App = () => {
  const { connectWallet } = useConnectWallet()
  const { ready } = useWallets()
  const { address, openWallet, openBridge } = useInitiaWidget()

  if (!address) {
    return (
      <button onClick={connectWallet} disabled={!ready}>
        {ready ? "Connect" : "Loading..."}
      </button>
    )
  }

  return (
    <>
      <button onClick={openBridge}>Bridge</button>
      <button onClick={openWallet}>{truncate(address)}</button>
    </>
  )
}
```

> Wrap your app in `<InitiaWidgetProvider>` at the root to enable these hooks.

### Requesting a Transaction

```tsx
// v1
import { useWallet } from "@initia/react-wallet-widget"

const App = () => {
  const { requestTx } = useWallet()

  const mutate = async () => {
    const transactionHash = await requestTx({ messages: [] }, { chainId: "interwoven-1" })
    console.log(transactionHash)
  }

  return <button onClick={mutate}>Submit</button>
}
```

```tsx
// v2
import { useInitiaWidget } from "@initia/widget-react"

const App = () => {
  const { requestTxBlock } = useInitiaWidget()

  const mutate = async () => {
    const { transactionHash } = await requestTxBlock({ messages: [], chainId: "interwoven-1" })
    console.log(transactionHash)
  }

  return <button onClick={mutate}>Submit</button>
}
```

## 5. Interoperability with `@initia/initia.js`

If you need to build message objects using `@initia/initia.js`, use the following helper:

```tsx
import { MsgSend, Msg } from "@initia/initia.js"

function toEncodeObject(msg: Msg) {
  const data = msg.toData()
  return {
    typeUrl: data["@type"],
    value: msg.toProto(),
  }
}

// Example usage
const App = () => {
  const { initiaAddress, requestTxBlock } = useInitiaWidget()

  const mutate = async () => {
    const msgs = [
      MsgSend.fromProto({
        fromAddress: initiaAddress,
        toAddress: initiaAddress,
        amount: [{ amount: "1000000", denom: "uinit" }],
      }),
    ]

    const messages = msgs.map(toEncodeObject)
    const { transactionHash } = await requestTxBlock({ messages, chainId: "interwoven-1" })
    console.log(transactionHash)
  }

  return <button onClick={mutate}>Send</button>
}
```
