import clsx from "clsx"
import type { PropsWithChildren } from "react"
import { IconWarningFilled } from "@initia/icons-react"
import Loader from "../Loader"
import styles from "./InputHelp.module.css"

interface Props {
  level: "info" | "warning" | "error" | "success" | "loading"
  className?: string
  mt?: number
}

const InputHelp = ({ level, className, mt = 8, children }: PropsWithChildren<Props>) => {
  if (!children) return null
  return (
    <div className={clsx(styles.help, styles[level], className)} style={{ marginTop: mt }}>
      <div className={styles.icon}>
        {level === "loading" ? <Loader size={12} /> : <IconWarningFilled size={12} />}
      </div>
      <p>{children}</p>
    </div>
  )
}

export default InputHelp
