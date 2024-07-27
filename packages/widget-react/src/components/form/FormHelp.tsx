import clsx from "clsx"
import type { PropsWithChildren } from "react"
import InputHelp from "./InputHelp"
import styles from "./FormHelp.module.css"

interface Props {
  level: "info" | "warning" | "error" | "success"
}

const FormHelpStack = ({ children }: PropsWithChildren) => {
  if (!children) return null
  return <div className={styles.stack}>{children}</div>
}

const FormHelp = (props: PropsWithChildren<Props>) => {
  return <InputHelp {...props} className={clsx(styles.help, styles[props.level])} mt={0} />
}

FormHelp.Stack = FormHelpStack

export default FormHelp
