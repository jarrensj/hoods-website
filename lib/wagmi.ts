import { robinhood, robinhoodTestnet } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { chain } from "./chain";

// Browser wallets announce themselves (EIP-6963) and are added automatically.
// `injected()` covers wallets that don't, such as some in-app mobile browsers.
export const config = createConfig({
  chains: [chain],
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
