import { robinhood, robinhoodTestnet } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { chain } from "./chain";

// Both networks are configured: the site's own first, plus testnet for the
// /testnet tools page, which stays on testnet when the site is on mainnet.
// Browser wallets announce themselves (EIP-6963) and are added automatically.
// `injected()` covers wallets that don't, such as some in-app mobile browsers.
export const config = createConfig({
  chains: chain.id === robinhood.id ? [robinhood, robinhoodTestnet] : [robinhoodTestnet, robinhood],
  connectors: [injected()],
  transports: {
    [robinhood.id]: http(),
    [robinhoodTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
