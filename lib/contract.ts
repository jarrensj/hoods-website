import { isAddress, type Address } from "viem";
import { chain } from "./chain";

const configured = process.env.NEXT_PUBLIC_HOODS_CONTRACT_ADDRESS;

// The HOODS contract on the chosen network. Unset (or not a valid address)
// until the contract is deployed, which hides anything that links to it.
export const contractAddress: Address | undefined =
  configured && isAddress(configured) ? configured : undefined;

// The contract's page on the network's block explorer.
export const contractUrl =
  contractAddress && `${chain.blockExplorers.default.url}/address/${contractAddress}`;
