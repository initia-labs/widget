/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BcsType} from "@mysten/bcs";
import { bcs, fromHex, toHex } from "@mysten/bcs"

export type MsgExecuteContent = Record<string, any>

function parseTypes(type: string): BcsType<any, any> {
  const [firstType, ...innerTypes] = type.split("<")
  const parsedType = [firstType.split("::").at(-1), ...innerTypes].join("<").toLocaleLowerCase()

  if (parsedType.startsWith("option")) {
    return bcs.option(parseTypes(type.replace("option<", "").slice(0, -1)))
  }

  if (parsedType.startsWith("vector")) {
    return bcs.vector(parseTypes(type.replace("vector<", "").slice(0, -1)))
  }

  switch (parsedType) {
    case "address":
      return bcs.bytes(32).transform({
        input: (val: string) => fromHex(val),
        output: (val) => toHex(val),
      })

    case "string":
      return bcs.string()

    case "u8":
      return bcs.u8()

    case "u16":
      return bcs.u16()

    case "u32":
      return bcs.u32()

    case "u64":
      return bcs.u64()

    case "u128":
      return bcs.u128()

    case "u256":
      return bcs.u256()

    case "bool":
      return bcs.bool()

    default:
      throw new Error(`Unsupported type: ${type}`)
  }
}

export function stringifyBcsArgs(
  value: Uint8Array[],
  types: string[],
): { type: string; encoded: Uint8Array; decoded: string; error?: true }[] {
  const parsedTypes = types.filter((type) => !type.startsWith("&"))
  return value.map((data, index) => {
    try {
      return {
        type: parsedTypes[index],
        encoded: data,
        decoded: parseTypes(parsedTypes[index]).parse(data),
      }
    } catch {
      return { type: parsedTypes[index], encoded: data, decoded: "", error: true }
    }
  })
}
