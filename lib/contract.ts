import { BaseError, decodeErrorResult, isAddress, type Abi, type Address, type Hex } from "viem";
import { chain, type SiteChain } from "./chain";
import hoodsAbiJson from "./contracts/Hoods.abi.json";

const configured = process.env.NEXT_PUBLIC_HOODS_CONTRACT_ADDRESS;

// The HOODS contract on the chosen network. Unset (or not a valid address)
// until the contract is deployed, which hides anything that links to it.
export const contractAddress: Address | undefined =
  configured && isAddress(configured) ? configured : undefined;

// The contract's ABI, copied from hoods-contract's abi/Hoods.json (see its
// WEBSITE.md). Copy it again whenever the contract's interface changes.
export const hoodsAbi = hoodsAbiJson as Abi;

const testnetConfigured = process.env.NEXT_PUBLIC_HOODS_TESTNET_CONTRACT_ADDRESS;

// The testnet contract the /testnet tools page works on. When it isn't set and
// the site itself is on testnet, that's the site's contract, so previews need no
// extra setting.
export const testnetContractAddress: Address | undefined =
  testnetConfigured && isAddress(testnetConfigured)
    ? testnetConfigured
    : chain.testnet
      ? contractAddress
      : undefined;

// A contract's page on a network's block explorer.
export function addressUrl(address: string, on: SiteChain = chain) {
  return `${on.blockExplorers.default.url}/address/${address}`;
}

// The site's contract on its network's block explorer.
export const contractUrl = contractAddress && addressUrl(contractAddress);

// A transaction's page on a network's block explorer.
export function transactionUrl(hash: string, on: SiteChain = chain) {
  return `${on.blockExplorers.default.url}/tx/${hash}`;
}

// When a sent transaction reverts, wagmi's waitForTransactionReceipt replays it
// and throws what the replay threw. The innermost cause carries the revert
// data (viem reads it the same way); decode it against the HOODS ABI to get the
// contract error's name and arguments.
export function decodeRevert(error: unknown) {
  if (!(error instanceof BaseError)) return undefined;
  const cause = error.walk() as { data?: Hex | { data?: Hex } } | null;
  const data = typeof cause?.data === "object" ? cause.data?.data : cause?.data;
  if (typeof data !== "string" || data.length < 10) return undefined;
  try {
    return decodeErrorResult({ abi: hoodsAbi, data });
  } catch {
    return undefined;
  }
}
