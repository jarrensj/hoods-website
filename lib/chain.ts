import { robinhood, robinhoodTestnet } from "viem/chains";

// The Robinhood Chain network the site connects to. Defaults to testnet so a
// missing setting never points people at mainnet before launch.
export const chain =
  process.env.NEXT_PUBLIC_ROBINHOOD_NETWORK === "mainnet" ? robinhood : robinhoodTestnet;

// The /testnet tools page always works on testnet, whatever the site uses.
export const testnetChain = robinhoodTestnet;

export type SiteChain = typeof robinhood | typeof robinhoodTestnet;

// Look a network up by its ID. Pages pass IDs to client components, since the
// chain objects carry functions that can't cross the server/client boundary.
export function siteChainById(id: SiteChain["id"]): SiteChain {
  return id === robinhood.id ? robinhood : robinhoodTestnet;
}
