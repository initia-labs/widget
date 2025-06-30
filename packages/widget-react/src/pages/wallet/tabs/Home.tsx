import { Tabs } from "radix-ui"
import { IconArrowRight, IconSwap } from "@initia/icons-react"
import { Link, useNavigate, usePath } from "@/lib/router"
import { useClaimableModal } from "@/pages/bridge/op/reminder"
import Scrollable from "@/components/Scrollable"
import Assets from "./assets/Assets"
import Nfts from "./nft/Nfts"
import Activity from "./activity/Activity"
import styles from "./Home.module.css"

const Home = () => {
  useClaimableModal()

  const navigate = useNavigate()
  const path = usePath()

  return (
    <Scrollable>
      <div className={styles.nav}>
        <Link to="/send" className={styles.item}>
          <IconArrowRight size={16} />
          <span>Send</span>
        </Link>

        <button className={styles.item} onClick={() => navigate("/bridge")}>
          <IconSwap size={16} />
          <span>Bridge/Swap</span>
        </button>
      </div>

      <Tabs.Root value={path} onValueChange={navigate}>
        <Tabs.List className={styles.tabs}>
          <Tabs.Trigger className={styles.tab} value="/">
            Assets
          </Tabs.Trigger>

          <Tabs.Trigger className={styles.tab} value="/nfts">
            NFTs
          </Tabs.Trigger>

          <Tabs.Trigger className={styles.tab} value="/activity">
            Activity
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="/">
          <Assets />
        </Tabs.Content>

        <Tabs.Content value="/nfts">
          <Nfts />
        </Tabs.Content>

        <Tabs.Content value="/activity">
          <Activity />
        </Tabs.Content>
      </Tabs.Root>
    </Scrollable>
  )
}

export default Home
