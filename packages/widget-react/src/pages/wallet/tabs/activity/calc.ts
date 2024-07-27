import { filter, groupBy, map, pipe, prop, values } from "ramda"
import BigNumber from "bignumber.js"
import { sha3_256 } from "@noble/hashes/sha3"
import { toHex } from "@cosmjs/encoding"
import type { Attribute, Event } from "@cosmjs/stargate/build/events"
import { Address } from "@/public/utils"

function primaryCoinStore(owner: string, coinMetadata: string) {
  const OBJECT_DERIVED_SCHEME = 0xfc
  const ownerBytes = Address.toBytes(owner, 32)
  const metadataBytes = Address.toBytes(coinMetadata, 32)
  const bytes = new Uint8Array([...ownerBytes, ...metadataBytes, OBJECT_DERIVED_SCHEME])
  return toHex(sha3_256.create().update(bytes).digest())
}

function parseMoveAttributes(attributes: readonly Attribute[]) {
  return Object.fromEntries(attributes.map(({ key, value }) => [key, value]))
}

interface Change {
  amount: string
  metadata: string
}

const accumulateChanges: (changes: Change[]) => Change[] = pipe(
  groupBy(prop("metadata")),
  values,
  map((changes = []) => {
    const { metadata } = changes[0]
    const amount = BigNumber.sum(...map(prop("amount"), changes)).toString()
    return { amount, metadata }
  }),
  filter<Change>(({ amount }) => !BigNumber(amount).isZero()),
)

export function calcChangesFromEvents(events: Event[], fee: Change, hexAddress: string) {
  try {
    const parsedMoveAttributes = events
      .filter(({ type }) => type === "move")
      .map(({ attributes }) => parseMoveAttributes(attributes))

    const change = parsedMoveAttributes.reduce(
      (acc, { type_tag, data }) => {
        try {
          const { amount, store_addr, metadata_addr } = JSON.parse(data)

          if ("0x" + primaryCoinStore(hexAddress, metadata_addr) !== store_addr) {
            return acc
          }

          if (type_tag === "0x1::fungible_asset::DepositEvent") {
            return [...acc, { amount: BigNumber(amount).toString(), metadata: metadata_addr }]
          }

          if (type_tag === "0x1::fungible_asset::WithdrawEvent") {
            return [
              ...acc,
              { amount: BigNumber(amount).negated().toString(), metadata: metadata_addr },
            ]
          }

          return acc
        } catch {
          return acc
        }
      },
      [fee],
    )

    return accumulateChanges(change)
  } catch {
    return accumulateChanges([])
  }
}
