import clsx from "clsx"
import { IconSearch } from "@initia/icons-react"
import { useAutoFocus } from "./hooks"
import styles from "./SearchInput.module.css"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const SearchInput = ({ value, onChange, placeholder = "Search", className }: Props) => {
  return (
    <div className={clsx(styles.wrapper, className)}>
      <label htmlFor="search" className={styles.label}>
        <IconSearch size={16} />
      </label>

      <input
        id="search"
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        ref={useAutoFocus()}
      />
    </div>
  )
}

export default SearchInput
