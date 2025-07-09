import type { BrowserProvider } from "ethers"
import type { RouterChainJson } from "./chains"

interface ProviderError extends Error {
  code?: number
}

export async function switchEvmChain(provider: BrowserProvider, chain: RouterChainJson) {
  const { chain_id, chain_name, evm_fee_asset, rpc, chain_type } = chain

  if (chain_type !== "evm")
    throw new Error(`Unable to switch to ${chain_name} [${chain_id}], it is not an EVM chain`)

  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: `0x${Number(chain_id).toString(16)}` },
    ])
  } catch (_e) {
    const e = _e as ProviderError
    // ensure wallet_switchEthereumChain failed due to chain not being added
    if (e.code !== 4902) throw e

    if (!evm_fee_asset)
      throw new Error(`Unable to add ${chain_name} [${chain_id}], no 'evm_fee_asset' provided`)

    // request wallet to add the chain
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
