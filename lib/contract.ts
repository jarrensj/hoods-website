import { isAddress, type Abi, type Address } from "viem";
import { chain } from "./chain";
import hoodsAbiJson from "./contracts/Hoods.abi.json";

const configured = process.env.NEXT_PUBLIC_HOODS_CONTRACT_ADDRESS;

// The HOODS contract on the chosen network. Unset (or not a valid address)
// until the contract is deployed, which hides anything that links to it.
export const contractAddress: Address | undefined =
  configured && isAddress(configured) ? configured : undefined;

// The contract's ABI, copied from hoods-contract's abi/Hoods.json (see its
// WEBSITE.md). Copy it again whenever the contract's interface changes.
export const hoodsAbi = hoodsAbiJson as Abi;

// The contract's page on the network's block explorer.
export const contractUrl =
  contractAddress && `${chain.blockExplorers.default.url}/address/${contractAddress}`;

// A transaction's page on the network's block explorer.
export function transactionUrl(hash: string) {
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}
