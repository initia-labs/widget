import ky from "ky"
import { bcs } from "@mysten/bcs"
import { toBase64 } from "@cosmjs/encoding"
import { Address } from "./address"

interface Params {
  restUrl: string
  moduleAddress: string
}

const moduleName = "usernames"

export function createUsernameClient({ restUrl, moduleAddress }: Params) {
  const restClient = ky.create({ prefixUrl: restUrl })

  interface ViewFunctionParams {
    moduleAddress: string
    moduleName: string
    functionName: string
    typeArgs: string[]
    args: string[]
  }

  async function view<T>(params: ViewFunctionParams) {
    const { moduleAddress, moduleName, functionName, typeArgs, args } = params
    const path = `initia/move/v1/accounts/${moduleAddress}/modules/${moduleName}/view_functions/${functionName}`
    const payload = { type_args: typeArgs, args }
    const { data, message } = await restClient
      .post(path, { json: payload })
      .json<{ data: string; message?: string }>()
    if (message) throw new Error(message)
    return JSON.parse(data) as T
  }

  async function getUsername(address: string) {
    if (!Address.validate(address)) return null
    const name = await view<string>({
      moduleAddress,
      moduleName,
      functionName: "get_name_from_address",
      typeArgs: [],
      args: [toBase64(Address.toBytes(address, 32))],
    })
    if (!name) return null
    return name + ".init"
  }

  function validateUsername(username: string) {
    return /^[A-Za-z0-9-]{3,64}\.init$/.test(username)
  }

  async function getAddress(username: string) {
    if (!validateUsername(username)) return null
    const address = await view<string>({
      moduleAddress,
      moduleName,
      functionName: "get_address_from_name",
      typeArgs: [],
      args: [bcs.string().serialize(username.toLowerCase().replace(".init", "")).toBase64()],
    })
    if (!address) return null
    return Address.toBech32(address)
  }

  return { restUrl, getUsername, getAddress, validateUsername }
}
