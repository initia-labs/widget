import { useEffect, useState } from "react"
import { useWallets } from "@privy-io/react-auth"
import { InitiaWidgetProvider, TESTNET } from "@initia/widget-react"
import Connection from "./Connection"
import Send from "./Send"
import Bridge from "./Bridge"
import styles from "./App.module.css"

const isTestnet = import.meta.env.INITIA_NETWORK_TYPE === "testnet"

const App = () => {
  const { wallets } = useWallets()
  const wallet = wallets[0]

  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"))

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <InitiaWidgetProvider wallet={wallet} {...(isTestnet ? TESTNET : {})} theme={theme}>
      <div className={styles.container}>
        <header className={styles.header}>
          {isTestnet ? (
            <h1 className={styles.title} data-testnet>
              Initia Testnet
            </h1>
          ) : (
            <h1 className={styles.title}>Initia</h1>
          )}
          <div className={styles.controls}>
            <button className={styles.toggle} onClick={toggleTheme}>
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <Connection />
          </div>
        </header>

        <Send />
        <Bridge />
      </div>
    </InitiaWidgetProvider>
  )
}

export default App
