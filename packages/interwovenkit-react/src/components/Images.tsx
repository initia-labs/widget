import Image from "./Image"
import styles from "./Images.module.css"

interface Props {
  assetLogoUrl?: string
  chainLogoUrl?: string
}

const Images = ({ assetLogoUrl, chainLogoUrl }: Props) => {
  return (
    <div className={styles.images}>
      <Image src={assetLogoUrl} width={36} height={36} />
      <Image src={chainLogoUrl} width={18} height={18} className={styles.chain} />
    </div>
  )
}

export default Images
