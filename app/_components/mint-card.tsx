"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
  formatEther,
  isAddressEqual,
  parseEventLogs,
} from "viem";
import {
  useBalance,
  useConfig,
  useConnection,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { simulateContract } from "wagmi/actions";
import { chain } from "@/lib/chain";
import { contractAddress, decodeRevert, hoodsAbi, transactionUrl } from "@/lib/contract";
import { WalletPicker, useDismiss } from "./connect-wallet";

const SUPPLY = 51;

// The mainnet price, shown until the contract address is set. After that the
// card reads MINT_PRICE from the contract, so a testnet contract with a
// different price shows its own.
const PLANNED_PRICE = "0.0333";

// Shown before the contract address is set. Once it is, the contract decides:
// "Mint is disabled" while mintEnabled is false.
const mintOpens = (
  <>
    Mint opens{" "}
    <time dateTime="2026-11-23T13:00-08:00">
      Nov 23
      <span className="mt-1.5 block text-[13px] tracking-[0.14em]">1:00 PM PST</span>
    </time>
  </>
);

// Read the contract when the page loads, not on a timer or when the tab regains
// focus. A refresh gets fresh numbers. The card also re-reads after this
// visitor's own mint, or when the pre-send check refuses one.
const readOnLoad = { refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

const revertMessages: Record<string, string> = {
  MintDisabled: "Mint is disabled.",
  AlreadyMinted: "This wallet has already minted.",
  MaxSupplyReached: `All ${SUPPLY} HOODS have been minted.`,
  WrongMintPrice: "The amount sent didn't match the mint price.",
};

function mintErrorMessage(error: Error | null) {
  if (!error) return null;
  if (!(error instanceof BaseError)) return error.message;

  const revert = error.walk((cause) => cause instanceof ContractFunctionRevertedError);
  const errorName = revert instanceof ContractFunctionRevertedError ? revert.data?.errorName : undefined;
  if (errorName && revertMessages[errorName]) return revertMessages[errorName];

  if (error.walk((cause) => cause instanceof UserRejectedRequestError)) {
    return "Request cancelled in your wallet.";
  }
  if (error.walk((cause) => cause instanceof InsufficientFundsError)) {
    return `Not enough ETH on ${chain.name} to mint and pay for gas.`;
  }
  return error.shortMessage;
}

// The mint was sent but failed on-chain. Name the contract's reason if the
// replayed revert data carries one.
function revertedMessage(error: Error | null) {
  if (!error) return null;
  const revert = decodeRevert(error);
  if (!revert && !/revert/i.test(error.message)) return mintErrorMessage(error);
  const reason = revert ? (revertMessages[revert.errorName] ?? `${revert.errorName}.`) : null;
  return ["The mint transaction failed on-chain.", reason, "Only gas was spent."].filter(Boolean).join(" ");
}

export default function MintCard() {
  const { address, chainId, status } = useConnection();
  // A local copy, so TypeScript keeps the "is set" check inside callbacks.
  const hoodsAddress = contractAddress;
  const hoods = { address: hoodsAddress, abi: hoodsAbi, chainId: chain.id } as const;

  const contractState = useReadContracts({
    contracts: [
      { ...hoods, functionName: "MINT_PRICE" },
      { ...hoods, functionName: "totalMinted" },
      { ...hoods, functionName: "mintEnabled" },
    ],
    allowFailure: false,
    query: { ...readOnLoad, enabled: Boolean(contractAddress) },
  });
  const [price, totalMinted, mintEnabled] =
    (contractState.data as readonly [bigint, bigint, boolean] | undefined) ?? [];

  const hasMinted = useReadContract({
    ...hoods,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    query: { ...readOnLoad, enabled: Boolean(contractAddress && address) },
  });
  const balance = useBalance({
    address,
    chainId: chain.id,
    query: { ...readOnLoad, enabled: Boolean(address) },
  });

  const config = useConfig();
  const switchChain = useSwitchChain();
  const [checking, setChecking] = useState(false);
  // Why the pre-send check refused, kept per wallet so switching wallets clears it.
  const [preflight, setPreflight] = useState<{ address: string; error: Error } | null>(null);
  const mint = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: mint.data, chainId: chain.id });

  // "Connect a wallet to mint" opens the same wallet list as the header's
  // "Connect wallet", just under the button.
  const [pickerOpen, setPickerOpen] = useState(false);
  const connectRef = useRef<HTMLDivElement>(null);
  const pickerId = useId();
  useDismiss(pickerOpen, setPickerOpen, connectRef);

  // A finished mint changes the count, this wallet's hasMinted, and its balance.
  // So does a failed one: it usually means the contract changed since the page
  // loaded (sold out, say), and it cost gas.
  const { refetch: refetchContractState } = contractState;
  const { refetch: refetchHasMinted } = hasMinted;
  const { refetch: refetchBalance } = balance;
  const settledHash = receipt.isSuccess || receipt.isError ? mint.data : undefined;
  useEffect(() => {
    if (!settledHash) return;
    refetchContractState();
    refetchHasMinted();
    refetchBalance();
  }, [settledHash, refetchContractState, refetchHasMinted, refetchBalance]);

  // A different wallet starts fresh.
  const { reset: resetMint } = mint;
  useEffect(() => resetMint(), [address, resetMint]);

  const mintedTokenId =
    receipt.data?.status === "success" && hoodsAddress
      ? (
          parseEventLogs({ abi: hoodsAbi, eventName: "Transfer", logs: receipt.data.logs }).find((log) =>
            isAddressEqual(log.address, hoodsAddress),
          )?.args as { tokenId?: bigint } | undefined
        )?.tokenId
      : undefined;

  // Before a contract address is set nothing can have been minted, so show 0.
  // With one set, "–" means the count is still loading or couldn't be read.
  const minted = !hoodsAddress ? 0 : totalMinted === undefined ? undefined : Number(totalMinted);
  const priceLabel = hoodsAddress ? (price === undefined ? "–" : formatEther(price)) : PLANNED_PRICE;
  const stats = [
    { label: "Supply", value: String(SUPPLY) },
    { label: "Per wallet", value: "1" },
    { label: "Price (ETH)", value: priceLabel },
  ];

  // What the button says, and what it does (nothing when disabled).
  let label: ReactNode;
  let onClick: (() => void) | undefined;
  let opensPicker = false;
  if (!hoodsAddress) {
    label = mintOpens;
  } else if (contractState.isPending) {
    label = "Loading…";
  } else if (contractState.isError || price === undefined || minted === undefined) {
    label = "Can't reach the contract";
  } else if (checking) {
    label = "Checking…";
  } else if (mint.isPending) {
    label = "Confirm in your wallet…";
  } else if (mint.data && receipt.isPending) {
    label = "Minting…";
  } else if (mintedTokenId !== undefined || hasMinted.data === true) {
    label = "Minted";
  } else if (minted >= SUPPLY) {
    label = "Sold out";
  } else if (!mintEnabled) {
    label = "Mint is disabled";
  } else if (status !== "connected" || !address) {
    label = "Connect a wallet to mint";
    opensPicker = true;
    onClick = () => setPickerOpen((open) => !open);
  } else if (chainId !== chain.id) {
    label = switchChain.isPending ? "Check your wallet…" : `Switch to ${chain.name}`;
    if (!switchChain.isPending) onClick = () => switchChain.mutate({ chainId: chain.id });
  } else if (balance.data && balance.data.value < price) {
    label = "Not enough ETH";
  } else {
    label = `Mint for ${formatEther(price)} ETH`;
    onClick = async () => {
      setPreflight(null);
      setChecking(true);
      try {
        // Run the mint as a read-only call from this wallet first. A mint the
        // contract would reject, such as the last one being taken since the page
        // loaded, fails here for free instead of costing gas on-chain.
        const { request } = await simulateContract(config, {
          ...hoods,
          address: hoodsAddress,
          functionName: "mint",
          value: price,
          account: address,
        });
        mint.mutate(request);
      } catch (error) {
        setPreflight({ address, error: error as Error });
        refetchContractState();
        refetchHasMinted();
      } finally {
        setChecking(false);
      }
    };
  }

  const error =
    mintErrorMessage(
      (preflight && preflight.address === address ? preflight.error : null) ?? mint.error ?? switchChain.error,
    ) ?? revertedMessage(receipt.error);

  return (
    <div className="bg-navy p-6 text-paper sm:p-8">
      {/* The price column fits its value, which comes from the contract and can be
          longer than the others. */}
      <dl className="grid grid-cols-[1fr_1fr_auto] items-end gap-4">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-mist">{label}</dt>
            <dd className="mt-2 whitespace-nowrap font-slab text-[clamp(28px,3.05vw,44px)] leading-none">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-7 flex flex-col gap-2.5">
        <div className="flex justify-between gap-3 text-xs font-extrabold uppercase tracking-[0.14em]">
          <span>
            {minted ?? "–"} of {SUPPLY} minted
          </span>
          <span className="text-mist">{minted === undefined ? "–" : SUPPLY - minted} left</span>
        </div>
        <div
          role="progressbar"
          aria-label="HOODS minted"
          aria-valuemin={0}
          aria-valuemax={SUPPLY}
          aria-valuenow={minted ?? 0}
          className="h-1.5 bg-forest"
        >
          <div className="h-full bg-leaf" style={{ width: `${((minted ?? 0) / SUPPLY) * 100}%` }} />
        </div>
      </div>

      <div ref={connectRef} className="relative mt-7">
        <button
          type="button"
          disabled={!onClick}
          onClick={onClick}
          aria-expanded={opensPicker ? pickerOpen : undefined}
          aria-controls={opensPicker ? pickerId : undefined}
          className="w-full bg-paper py-[22px] text-lg font-black uppercase tracking-[0.06em] text-navy transition-transform duration-150 enabled:hover:-translate-y-px disabled:cursor-not-allowed"
        >
          {label}
        </button>

        {/* Over what's below rather than pushing it down. */}
        {opensPicker && pickerOpen && (
          <div id={pickerId} className="absolute inset-x-0 top-full z-10 mt-2 border-2 border-paper bg-navy p-3 text-paper">
            <WalletPicker chainId={chain.id} onConnected={() => setPickerOpen(false)} />
          </div>
        )}
      </div>

      {mintedTokenId !== undefined && mint.data ? (
        <p role="status" className="mt-4 text-sm font-semibold">
          You minted HOODS #{mintedTokenId.toString()}.{" "}
          <a
            href={transactionUrl(mint.data)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-extrabold underline decoration-2 underline-offset-4"
          >
            View transaction <span aria-hidden="true">↗</span>
          </a>
        </p>
      ) : hasMinted.data === true ? (
        <p className="mt-4 text-sm font-semibold text-mist">This wallet has already minted its HOODS.</p>
      ) : null}

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold">
          {error}
        </p>
      )}

      {/* Last in the card, so the mint's own feedback above stays next to the button. */}
      <p className="mt-4 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-mist">
        No promises. No roadmap.
      </p>
    </div>
  );
}
