import { robinhood, robinhoodTestnet } from "viem/chains";

// The Robinhood Chain network the site connects to. Defaults to testnet so a
// missing setting never points people at mainnet before launch.
export const chain =
  process.env.NEXT_PUBLIC_ROBINHOOD_NETWORK === "mainnet" ? robinhood : robinhoodTestnet;
