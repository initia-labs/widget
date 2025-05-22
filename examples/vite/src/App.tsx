import { useEffect, useState } from "react"
import { useWallets } from "@privy-io/react-auth"
import { InitiaWidgetProvider, TESTNET } from "@initia/widget-react"
import Connection from "./Connection"
import Send from "./Send"
import styles from "./App.module.css"

const App = () => {
  const { wallets } = useWallets()
  const wallet = wallets[0]

  const [isTestnet, setIsTestnet] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"))

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <InitiaWidgetProvider wallet={wallet} {...(isTestnet ? TESTNET : {})} theme={theme}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            onClick={() => setIsTestnet((prev) => !prev)}
            className={styles.title}
            data-testnet={isTestnet}
          >
            Initia{isTestnet ? " Testnet" : ""}
          </button>

          <div className={styles.controls}>
            <button className={styles.toggle} onClick={toggleTheme}>
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <Connection />
          </div>
        </header>

        <Send />
      </div>
    </InitiaWidgetProvider>
  )
}

export default App
