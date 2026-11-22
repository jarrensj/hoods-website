import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { chain } from "@/lib/chain";
import { contractAddress } from "@/lib/contract";
import ConnectWallet from "../_components/connect-wallet";
import TestnetTools from "./testnet-tools";

export const metadata: Metadata = {
  title: "HOODS testnet tools",
  robots: { index: false, follow: false },
};

// Tools for testing the contract on testnet: mint with any amount, open or close
// minting, and withdraw. Only served on testnet with a contract address set, so
// production (no contract yet, then mainnet) answers 404.
export default function TestnetPage() {
  if (!chain.testnet || !contractAddress) notFound();

  return (
    <main className="flex-1">
      <header className="flex items-center justify-between gap-4 px-6 py-7 md:px-16">
        <span className="text-[22px] font-black uppercase tracking-[-0.02em]">Hoods · Testnet tools</span>
        <div className="flex items-center gap-3">
          <span className="hidden whitespace-nowrap rounded-full border-2 border-paper px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] sm:inline-block">
            {chain.name}
          </span>
          <ConnectWallet />
        </div>
      </header>
      <TestnetTools />
    </main>
  );
}
