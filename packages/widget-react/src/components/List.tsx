import Scrollable from "./Scrollable"
import Image from "./Image"
import styles from "./List.module.css"

interface Props<Item> {
  onSelect: (item: Item) => void
  list: Item[]
  getImage: (item: Item) => string
  getName: (item: Item) => string
  getKey: (item: Item) => string
}

function List<Item>({ onSelect, list, getImage, getName, getKey }: Props<Item>) {
  return (
    <Scrollable className={styles.scrollable}>
      <div className={styles.list}>
        {list.map((item) => (
          <button className={styles.item} onClick={() => onSelect(item)} key={getKey(item)}>
            <Image src={getImage(item)} width={32} height={32} />
            <span>{getName(item)}</span>
          </button>
        ))}
      </div>
    </Scrollable>
  )
}

export default List
