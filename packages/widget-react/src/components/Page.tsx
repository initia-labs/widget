import type { PropsWithChildren, ReactNode } from "react"
import { IconBack } from "@initia/icons-react"
import { useNavigate } from "@/lib/router"
import Scrollable from "./Scrollable"
import styles from "./Page.module.css"

interface Props {
  title: string
  onGoBack?: (() => void) | false
  extra?: ReactNode
}

const Page = ({ title, onGoBack, extra, children }: PropsWithChildren<Props>) => {
  const navigate = useNavigate()

  return (
    <>
      <header className={styles.header}>
        {typeof onGoBack !== "boolean" && (
          <button className={styles.back} onClick={onGoBack ?? (() => navigate(-1))}>
            <IconBack size={16} />
          </button>
        )}

        <h1 className={styles.title}>{title}</h1>

        {extra}
      </header>

      <Scrollable>{children}</Scrollable>
    </>
  )
}

export default Page
