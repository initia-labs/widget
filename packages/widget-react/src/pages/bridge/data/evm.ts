import type { BrowserProvider } from "ethers"
import type { RouterChainJson } from "./chains"

export async function switchEvmChain(provider: BrowserProvider, chain: RouterChainJson) {
  const { chain_id, chain_name, evm_fee_asset, rpc } = chain
  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: `0x${Number(chain_id).toString(16)}` },
    ])
  } catch {
    // Chain not added, request user to add it
    await provider.send("wallet_addEthereumChain", [
      {
        chainId: `0x${Number(chain_id).toString(16)}`,
        chainName: chain_name,
        nativeCurrency: evm_fee_asset,
        rpcUrls: [rpc],
      },
    ])

    await provider.send("wallet_switchEthereumChain", [
      { chainId: `0x${Number(chain_id).toString(16)}` },
    ])
  }
}
