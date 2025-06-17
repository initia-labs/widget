/* eslint-disable @typescript-eslint/no-explicit-any */
import { bcs, fromHex, toHex } from "@mysten/bcs"

function parseTypes(type: string): any {
  const [firstType, ...innerTypes] = type.split("<")
  const parsedType = [firstType.split("::").at(-1), ...innerTypes].join("<").toLocaleLowerCase()

  if (parsedType.startsWith("option")) {
    return bcs.option(parseTypes(type.replace("option<", "").slice(0, -1)))
  }

  if (parsedType.startsWith("vector")) {
    return bcs.vector(parseTypes(type.replace("vector<", "").slice(0, -1)))
  }

  /*
    if (parsedType.startsWith("object")) {
      return bcs.object()
    }*/

  switch (parsedType) {
    case "address":
      return bcs.bytes(32).transform({
        // To change the input type, you need to provide a type definition for the input
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

    /* cusom types */
    /*
      case "decimal128":
        return bcs.decimal128()
  
      case "decimal256":
        return bcs.decimal256()
  
      case "fixedPoint32":
        return bcs.fixedPoint32()
  
      case "fixedPoint64":
        return bcs.fixedPoint64()*/
  }
}

export function stringifyBcsArgs(
  value: Uint8Array[],
  types: string[],
): { type: string; encoded: Uint8Array; decoded: string }[] {
  const parsedTypes = types.filter((type) => !type.startsWith("&"))
  return value.map((data, index) => {
    try {
      return {
        type: parsedTypes[index],
        encoded: data,
        decoded: parseTypes(parsedTypes[index]).parse(data),
      }
    } catch {
      return { type: parsedTypes[index], encoded: data, decoded: "" }
    }
  })
}
