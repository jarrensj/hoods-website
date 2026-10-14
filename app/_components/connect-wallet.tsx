"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { BaseError } from "viem";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { chain } from "@/lib/chain";

const buttonClass =
  "rounded-full border-2 border-ink bg-paper px-4 py-2 text-xs font-black uppercase tracking-widest text-ink shadow-[3px_3px_0_0_var(--ink)] transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-70 sm:text-sm";

const itemClass =
  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-bold hover:bg-paper/10 focus-visible:bg-paper/10 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function errorMessage(error: Error | null) {
  if (!error) return null;
  if (error.name === "UserRejectedRequestError") return "Request cancelled in your wallet.";
  return (error as BaseError).shortMessage ?? error.message;
}

export default function ConnectWallet() {
  const { address, chainId, status } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (status === "connected" && chainId !== chain.id) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          className={buttonClass}
          disabled={switchChain.isPending}
          onClick={() => switchChain.switchChain({ chainId: chain.id })}
        >
          {switchChain.isPending ? "Check wallet…" : "Switch network"}
        </button>
        {switchChain.error && (
          <p role="alert" className="max-w-56 text-right text-xs font-semibold text-paper">
            {errorMessage(switchChain.error)}
          </p>
        )}
      </div>
    );
  }

  // Wallets that announced themselves; fall back to the generic injected
  // wallet only when none did but one is present on the page.
  const announced = connectors.filter((connector) => connector.id !== "injected");
  const hasInjected = typeof window !== "undefined" && "ethereum" in window;
  const available = announced.length
    ? announced
    : connectors.filter((connector) => connector.id === "injected" && hasInjected);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={buttonClass}
        aria-expanded={open}
        aria-controls={menuId}
        disabled={status === "connecting" || status === "reconnecting"}
        onClick={() => setOpen((value) => !value)}
      >
        {status === "connected" && address
          ? <span className="normal-case">{shortAddress(address)}</span>
          : status === "connecting" || status === "reconnecting"
            ? "Connecting…"
            : "Connect wallet"}
      </button>

      {open && (
        <div id={menuId} className="ink-panel absolute right-0 top-full z-10 mt-3 w-72 p-3">
          {status === "connected" && address ? (
            <>
              <p className="px-3 pt-1 text-xs font-bold uppercase tracking-widest text-paper/60">
                {chain.name}
              </p>
              <p className="px-3 pb-2 pt-1 font-slab text-lg">{shortAddress(address)}</p>
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  disconnect.disconnect();
                }}
              >
                Disconnect
              </button>
            </>
          ) : available.length ? (
            <>
              <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-paper/60">
                Choose a wallet
              </p>
              <ul>
                {available.map((connector) => (
                  <li key={connector.uid}>
                    <button
                      type="button"
                      className={itemClass}
                      disabled={connect.isPending}
                      onClick={() =>
                        connect.connect(
                          { connector, chainId: chain.id },
                          { onSuccess: () => setOpen(false) },
                        )
                      }
                    >
                      {connector.icon ? (
                        <Image src={connector.icon} alt="" width={24} height={24} unoptimized className="rounded" />
                      ) : (
                        <span aria-hidden="true" className="h-6 w-6 rounded bg-paper/20" />
                      )}
                      {connector.id === "injected" ? "Browser wallet" : connector.name}
                    </button>
                  </li>
                ))}
              </ul>
              {connect.error && (
                <p role="alert" className="px-3 pt-2 text-sm text-paper/80">
                  {errorMessage(connect.error)}
                </p>
              )}
            </>
          ) : (
            <p className="p-3 text-sm text-paper/80">
              No wallet found. Install a browser wallet such as MetaMask or Rabby, or open this page
              in your wallet app&apos;s browser.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
