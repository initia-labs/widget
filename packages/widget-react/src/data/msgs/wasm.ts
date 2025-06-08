import type { AminoMsg } from "@cosmjs/amino"
import { fromUtf8, toUtf8 } from "@cosmjs/encoding"
import type { GeneratedType } from "@cosmjs/proto-signing"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"

interface AminoMsgExecuteContract extends AminoMsg {
  readonly type: "wasm/MsgExecuteContract"
  readonly value: {
    sender: string
    contract: string
    msg: object
    funds: {
      denom: string
      amount: string
    }[]
  }
}

export const wasmRegistry: [string, GeneratedType][] = [
  ["/cosmwasm.wasm.v1.MsgExecuteContract", MsgExecuteContract],
]

export const wasmAminoConverters = {
  "/cosmwasm.wasm.v1.MsgExecuteContract": {
    aminoType: "wasm/MsgExecuteContract",
    toAmino: ({
      sender,
      contract,
      msg,
      funds,
    }: MsgExecuteContract): AminoMsgExecuteContract["value"] => ({
      sender,
      contract,
      msg: JSON.parse(fromUtf8(msg)),
      funds,
    }),
    fromAmino: ({
      sender,
      contract,
      msg,
      funds,
    }: AminoMsgExecuteContract["value"]): MsgExecuteContract => ({
      sender,
      contract,
      msg: toUtf8(JSON.stringify(msg)),
      funds,
    }),
  },
}
