import Scrollable from "./Scrollable"
import Image from "./Image"
import styles from "./List.module.css"
import Loader from "./Loader"

interface Props<Item> {
  onSelect: (item: Item) => void
  list: Item[]
  getImage: (item: Item) => string
  getName: (item: Item) => string
  getKey: (item: Item) => string
  getIsLoading?: (item: Item) => boolean
  getDisabled?: (item: Item) => boolean
}

function List<Item>({
  onSelect,
  list,
  getImage,
  getName,
  getKey,
  getIsLoading,
  getDisabled,
}: Props<Item>) {
  return (
    <Scrollable className={styles.scrollable}>
      <div className={styles.list}>
        {list.map((item) => (
          <button
            className={styles.item}
            onClick={() => onSelect(item)}
            key={getKey(item)}
            disabled={getDisabled?.(item)}
          >
            <Image src={getImage(item)} width={32} height={32} />
            <span className={styles.name}>{getName(item)}</span>
            {getIsLoading?.(item) && <Loader size={16} />}
          </button>
        ))}
      </div>
    </Scrollable>
  )
}

export default List
