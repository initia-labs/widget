import clsx from "clsx"
import Image from "@/components/Image"
import styles from "./NftThumbnail.module.css"

interface Props {
  src?: string
  size?: number
  onClick?: () => void
}

const NftThumbnail = ({ src, size, onClick }: Props) => {
  if (onClick) {
    return (
      <button
        className={clsx(styles.thumbnail, styles.clickable)}
        onClick={onClick}
        style={{ width: size, height: size }}
      >
        <Image src={src} classNames={{ placeholder: styles.placeholder }} />
      </button>
    )
  }

  return (
    <div className={styles.thumbnail} style={{ width: size, height: size }}>
      <Image src={src} classNames={{ placeholder: styles.placeholder }} />
    </div>
  )
}

export default NftThumbnail
