import { filter, groupBy, map, pipe, prop, values } from "ramda"
import BigNumber from "bignumber.js"
import type { Attribute, Event } from "@cosmjs/stargate/build/events"
import { generateDerivedAddress } from "@/data/assets"

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
          const { amount, store_addr, metadata_addr: metadata } = JSON.parse(data)

          if (`0x${generateDerivedAddress(hexAddress, metadata)}` !== store_addr) {
            return acc
          }

          if (type_tag === "0x1::fungible_asset::DepositEvent") {
            return [...acc, { amount: BigNumber(amount).toString(), metadata }]
          }

          if (type_tag === "0x1::fungible_asset::WithdrawEvent") {
            return [...acc, { amount: BigNumber(amount).negated().toString(), metadata }]
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
