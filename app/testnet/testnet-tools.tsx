"use client";

import { useRef, useState } from "react";
import {
  BaseError,
  ContractFunctionRevertedError,
  formatEther,
  isAddress,
  isAddressEqual,
  parseEther,
  type Address,
  type Hash,
} from "viem";
import { useBalance, useConfig, useConnection, useReadContract, useReadContracts } from "wagmi";
import { simulateContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { testnetChain as chain } from "@/lib/chain";
import { addressUrl, decodeRevert, hoodsAbi, testnetContractAddress, transactionUrl } from "@/lib/contract";

type Status = "pending" | "ok" | "success" | "reverted" | "error";
type LogEntry = { id: number; action: string; status: Status; detail?: string; hash?: Hash };

// The base URI the contract was deployed with; the reveal never changes it.
const DEPLOYED_BASE_URI = "https://hoodspfp.s3.amazonaws.com/";
const DEPLOYED_ROYALTY_BPS = "510";

// Gas limit used when skipping the estimate, so a call that will revert still
// gets sent and reverts on-chain. Comfortably above what mint and the owner
// calls need.
const FORCED_GAS = BigInt(300_000);

const buttonClass =
  "rounded-full border-2 border-paper bg-paper px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-navy transition-transform duration-150 enabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50";
const ghostButtonClass =
  "rounded-full border-2 border-paper px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-paper enabled:hover:bg-paper enabled:hover:text-navy disabled:cursor-not-allowed disabled:opacity-50";

function formatRevert(revert: { errorName: string; args?: readonly unknown[] }) {
  return revert.args?.length ? `${revert.errorName}(${revert.args.map(String).join(", ")})` : revert.errorName;
}

function describeError(error: unknown) {
  const replayed = decodeRevert(error);
  if (replayed) return `Reverted: ${formatRevert(replayed)}`;
  if (error instanceof BaseError) {
    const revert = error.walk((cause) => cause instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      const args = revert.data?.args?.length ? `(${revert.data.args.map(String).join(", ")})` : "";
      if (name) return `Reverted: ${name}${args}`;
      if (revert.signature) return `Reverted with ${revert.signature}`;
    }
    return error.shortMessage;
  }
  return error instanceof Error ? error.message : String(error);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-paper/15 py-2 text-sm">
      <dt className="font-extrabold uppercase tracking-[0.12em] text-mist">{label}</dt>
      <dd className="break-all text-right font-semibold">{children}</dd>
    </div>
  );
}

export default function TestnetTools() {
  const config = useConfig();
  const { address, chainId, status } = useConnection();
  const hoodsAddress = testnetContractAddress;
  const hoods = { address: hoodsAddress, abi: hoodsAbi, chainId: chain.id } as const;
  const once = { refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

  const state = useReadContracts({
    contracts: [
      { ...hoods, functionName: "owner" },
      { ...hoods, functionName: "mintEnabled" },
      { ...hoods, functionName: "MINT_PRICE" },
      { ...hoods, functionName: "totalMinted" },
      { ...hoods, functionName: "MAX_SUPPLY" },
      // With a sale price of 10,000 wei, the royalty amount is the rate in basis points.
      { ...hoods, functionName: "royaltyInfo", args: [BigInt(1), BigInt(10_000)] },
      { ...hoods, functionName: "contractURI" },
    ],
    allowFailure: false,
    query: { ...once, enabled: Boolean(hoodsAddress) },
  });
  const [owner, mintEnabled, price, totalMinted, maxSupply, royalty, contractURI] =
    (state.data as
      | readonly [Address, boolean, bigint, bigint, bigint, readonly [Address, bigint], string]
      | undefined) ?? [];
  const [royaltyReceiver, royaltyBps] = royalty ?? [];
  // contractURI is {baseURI}contract.json, so the base URI is what comes before it.
  const baseURI = contractURI?.endsWith("contract.json") ? contractURI.slice(0, -"contract.json".length) : undefined;
  const contractBalance = useBalance({
    address: hoodsAddress,
    chainId: chain.id,
    query: { ...once, enabled: Boolean(hoodsAddress) },
  });
  const walletBalance = useBalance({ address, chainId: chain.id, query: { ...once, enabled: Boolean(address) } });
  const hasMinted = useReadContract({
    ...hoods,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    query: { ...once, enabled: Boolean(hoodsAddress && address) },
  });

  const refresh = () => {
    state.refetch();
    contractBalance.refetch();
    walletBalance.refetch();
    hasMinted.refetch();
  };

  const [amount, setAmount] = useState("");
  // Empty until someone types, which means "the contract's current value".
  const [royaltyReceiverInput, setRoyaltyReceiverInput] = useState("");
  const [royaltyBpsInput, setRoyaltyBpsInput] = useState("");
  const [baseURIInput, setBaseURIInput] = useState("");
  const [skipEstimate, setSkipEstimate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const nextId = useRef(0);

  const connected = status === "connected" && Boolean(address);
  const onTestnet = chainId === chain.id;
  const isOwner = Boolean(address && owner && isAddressEqual(address, owner));
  const canSend = connected && onTestnet && !busy;

  // The amount box is empty until someone types, which means "the contract's price".
  const amountText = amount === "" && price !== undefined ? formatEther(price) : amount;
  const receiverText = royaltyReceiverInput === "" ? (royaltyReceiver ?? "") : royaltyReceiverInput;
  const bpsText = royaltyBpsInput === "" ? (royaltyBps?.toString() ?? "") : royaltyBpsInput;
  const baseURIText = baseURIInput === "" ? (baseURI ?? "") : baseURIInput;

  function addLog(action: string, status: Status, detail?: string) {
    const id = nextId.current++;
    setLog((entries) => [{ id, action, status, detail }, ...entries]);
    return id;
  }
  function updateLog(id: number, patch: Partial<LogEntry>) {
    setLog((entries) => entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }

  function parseAmount(): bigint | undefined {
    try {
      return parseEther(amountText.trim());
    } catch {
      addLog(`Mint with "${amountText}" ETH`, "error", "Not a valid ETH amount.");
      return undefined;
    }
  }

  async function simulateMint() {
    const value = parseAmount();
    if (value === undefined || !hoodsAddress || !address) return;
    setBusy(true);
    const id = addLog(`Simulate mint with ${formatEther(value)} ETH`, "pending");
    try {
      await simulateContract(config, { ...hoods, address: hoodsAddress, functionName: "mint", value, account: address });
      updateLog(id, { status: "ok", detail: "Would succeed. Nothing was sent." });
    } catch (error) {
      updateLog(id, { status: "error", detail: `${describeError(error)} (nothing was sent)` });
    } finally {
      setBusy(false);
    }
  }

  async function send(action: string, request: { functionName: string; args?: readonly unknown[]; value?: bigint }) {
    if (!hoodsAddress) return;
    setBusy(true);
    const label = skipEstimate ? `${action} (gas estimate skipped)` : action;
    const id = addLog(label, "pending", "Confirm in your wallet…");
    let hash: Hash | undefined;
    try {
      hash = await writeContract(config, {
        ...hoods,
        address: hoodsAddress,
        ...request,
        ...(skipEstimate ? { gas: FORCED_GAS } : {}),
      });
      updateLog(id, { hash, detail: "Sent. Waiting for it to be mined…" });
      const receipt = await waitForTransactionReceipt(config, { hash, chainId: chain.id });
      updateLog(
        id,
        receipt.status === "success"
          ? { status: "success", detail: `Mined in block ${receipt.blockNumber}.` }
          : { status: "reverted", detail: "Reverted on-chain. Only gas was spent." },
      );
    } catch (error) {
      // Once there's a hash the transaction was sent, so a failure here means it
      // reverted on-chain (wagmi replays it to find out why).
      const revert = decodeRevert(error);
      updateLog(
        id,
        hash
          ? {
              status: "reverted",
              detail: `Reverted on-chain${revert ? `: ${formatRevert(revert)}` : ""}. Only gas was spent.`,
            }
          : { status: "error", detail: `${describeError(error)} (nothing was sent)` },
      );
    } finally {
      setBusy(false);
      refresh();
    }
  }

  function sendRoyalty() {
    const receiver = receiverText.trim();
    const bps = bpsText.trim();
    if (!isAddress(receiver)) {
      addLog(`setDefaultRoyalty(${receiver || "–"}, ${bps || "–"})`, "error", "The receiver isn't a valid address.");
      return;
    }
    if (!/^\d+$/.test(bps)) {
      addLog(`setDefaultRoyalty(${receiver}, ${bps || "–"})`, "error", "The rate must be a whole number of basis points.");
      return;
    }
    send(`setDefaultRoyalty(${receiver}, ${bps})`, { functionName: "setDefaultRoyalty", args: [receiver, BigInt(bps)] });
  }

  function sendBaseURI() {
    const value = baseURIText.trim();
    send(`setBaseURI("${value}")`, { functionName: "setBaseURI", args: [value] });
  }

  function sendMint() {
    const value = parseAmount();
    if (value === undefined) return;
    send(`Mint with ${formatEther(value)} ETH`, { functionName: "mint", value });
  }

  const presets =
    price === undefined
      ? []
      : [
          { label: "Correct", value: price },
          { label: "Too little", value: price / BigInt(2) },
          { label: "Too much", value: price * BigInt(2) },
          { label: "Zero", value: BigInt(0) },
        ];

  const statusColor: Record<Status, string> = {
    pending: "text-mist",
    ok: "text-leaf",
    success: "text-leaf",
    reverted: "text-paper",
    error: "text-paper",
  };

  return (
    <div className="grid gap-6 px-6 pb-16 md:grid-cols-2 md:px-16">
      <section className="bg-navy p-6 text-paper">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.14em]">Contract</h2>
          <button type="button" className={ghostButtonClass} onClick={refresh}>
            Refresh
          </button>
        </div>
        <dl className="mt-3">
          <Row label="Address">
            <a href={hoodsAddress && addressUrl(hoodsAddress, chain)} target="_blank" rel="noopener noreferrer" className="underline">
              {hoodsAddress}
            </a>
          </Row>
          <Row label="Owner">{owner ?? "–"}</Row>
          <Row label="Minting">{mintEnabled === undefined ? "–" : mintEnabled ? "Enabled" : "Disabled"}</Row>
          <Row label="Price">{price === undefined ? "–" : `${formatEther(price)} ETH`}</Row>
          <Row label="Minted">
            {totalMinted === undefined ? "–" : `${totalMinted} of ${maxSupply ?? "–"}`}
          </Row>
          <Row label="Balance">{contractBalance.data ? `${formatEther(contractBalance.data.value)} ETH` : "–"}</Row>
          <Row label="Royalty">
            {royaltyBps === undefined ? "–" : `${Number(royaltyBps) / 100}% (${royaltyBps} bps) to ${royaltyReceiver}`}
          </Row>
          <Row label="Base URI">{baseURI ?? "–"}</Row>
          <Row label="contractURI">{contractURI ?? "–"}</Row>
        </dl>
        {state.isError && (
          <p role="alert" className="mt-3 text-sm font-semibold">
            Couldn&apos;t read the contract: {describeError(state.error)}
          </p>
        )}

        <h2 className="mt-8 text-sm font-black uppercase tracking-[0.14em]">Your wallet</h2>
        {connected && address ? (
          <dl className="mt-3">
            <Row label="Address">{address}</Row>
            <Row label="Network">{onTestnet ? chain.name : `Wrong network (${chainId}). Switch in the header.`}</Row>
            <Row label="Balance">{walletBalance.data ? `${formatEther(walletBalance.data.value)} ETH` : "–"}</Row>
            <Row label="Has minted">{hasMinted.data === undefined ? "–" : hasMinted.data ? "Yes" : "No"}</Row>
            <Row label="Is owner">{isOwner ? "Yes" : "No"}</Row>
          </dl>
        ) : (
          <p className="mt-3 text-sm font-semibold text-mist">Connect a wallet in the header to send anything.</p>
        )}
      </section>

      <div className="flex flex-col gap-6">
        <section className="bg-navy p-6 text-paper">
          <h2 className="text-sm font-black uppercase tracking-[0.14em]">Mint</h2>
          <p className="mt-2 text-sm text-mist">
            Send any amount to see how the contract reacts. Anything but the exact price reverts with
            WrongMintPrice.
          </p>
          <label className="mt-4 block text-xs font-extrabold uppercase tracking-[0.12em] text-mist" htmlFor="amount">
            ETH to send
          </label>
          <input
            id="amount"
            inputMode="decimal"
            value={amountText}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-2 w-full bg-paper px-3 py-2.5 font-semibold text-navy"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={ghostButtonClass}
                onClick={() => setAmount(formatEther(preset.value))}
              >
                {preset.label} ({formatEther(preset.value)})
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={ghostButtonClass} disabled={!canSend} onClick={simulateMint}>
              Simulate (free)
            </button>
            <button type="button" className={buttonClass} disabled={!canSend} onClick={sendMint}>
              Send mint
            </button>
          </div>
        </section>

        <section className="bg-navy p-6 text-paper">
          <h2 className="text-sm font-black uppercase tracking-[0.14em]">Owner</h2>
          <p className="mt-2 text-sm text-mist">
            {isOwner
              ? "This wallet is the owner."
              : "This wallet isn't the owner, so these revert with OwnableUnauthorizedAccount. Try it."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClass}
              disabled={!canSend}
              onClick={() => send("setMintEnabled(true)", { functionName: "setMintEnabled", args: [true] })}
            >
              Enable mint
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={!canSend}
              onClick={() => send("setMintEnabled(false)", { functionName: "setMintEnabled", args: [false] })}
            >
              Disable mint
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={!canSend}
              onClick={() => send("withdraw()", { functionName: "withdraw" })}
            >
              Withdraw
            </button>
          </div>

          <h3 className="mt-7 text-xs font-black uppercase tracking-[0.14em]">Royalty</h3>
          <label className="mt-3 block text-xs font-extrabold uppercase tracking-[0.12em] text-mist" htmlFor="royalty-receiver">
            Receiver
          </label>
          <input
            id="royalty-receiver"
            value={receiverText}
            onChange={(event) => setRoyaltyReceiverInput(event.target.value)}
            spellCheck={false}
            className="mt-2 w-full bg-paper px-3 py-2.5 font-semibold text-navy"
          />
          <label className="mt-3 block text-xs font-extrabold uppercase tracking-[0.12em] text-mist" htmlFor="royalty-bps">
            Rate in basis points{/^\d+$/.test(bpsText.trim()) ? ` (${Number(bpsText.trim()) / 100}%)` : ""}
          </label>
          <input
            id="royalty-bps"
            inputMode="numeric"
            value={bpsText}
            onChange={(event) => setRoyaltyBpsInput(event.target.value)}
            className="mt-2 w-full bg-paper px-3 py-2.5 font-semibold text-navy"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={ghostButtonClass} onClick={() => setRoyaltyBpsInput(DEPLOYED_ROYALTY_BPS)}>
              5.1% (510)
            </button>
            <button type="button" className={ghostButtonClass} onClick={() => setRoyaltyBpsInput("10001")}>
              Over 100% (10001)
            </button>
            <button type="button" className={buttonClass} disabled={!canSend} onClick={sendRoyalty}>
              Set royalty
            </button>
          </div>

          <h3 className="mt-7 text-xs font-black uppercase tracking-[0.14em]">Base URI</h3>
          <input
            aria-label="Base URI"
            value={baseURIText}
            onChange={(event) => setBaseURIInput(event.target.value)}
            spellCheck={false}
            className="mt-3 w-full bg-paper px-3 py-2.5 font-semibold text-navy"
          />
          <p className="mt-2 break-all text-sm text-mist">
            {baseURIText.trim() && !baseURIText.trim().endsWith("/")
              ? `No trailing "/": token 1's metadata would be ${baseURIText.trim()}1, which is broken.`
              : `Token 1's metadata: ${baseURIText.trim()}1`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={ghostButtonClass} onClick={() => setBaseURIInput(DEPLOYED_BASE_URI)}>
              Restore {DEPLOYED_BASE_URI}
            </button>
            <button type="button" className={buttonClass} disabled={!canSend} onClick={sendBaseURI}>
              Set base URI
            </button>
          </div>
        </section>

        <section className="bg-navy p-6 text-paper">
          <label className="flex items-start gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={skipEstimate}
              onChange={(event) => setSkipEstimate(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              Skip the gas estimate. A call that will fail is sent anyway and reverts on-chain, costing gas.
              Your wallet may still warn you. Off: a failing call stops before anything is sent.
            </span>
          </label>
        </section>

        <section className="bg-navy p-6 text-paper">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.14em]">Log</h2>
            {log.length > 0 && (
              <button type="button" className={ghostButtonClass} onClick={() => setLog([])}>
                Clear
              </button>
            )}
          </div>
          {log.length === 0 ? (
            <p className="mt-3 text-sm text-mist">Nothing yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {log.map((entry) => (
                <li key={entry.id} className="border-b border-paper/15 pb-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-extrabold">{entry.action}</span>
                    <span className={`font-black uppercase tracking-[0.1em] ${statusColor[entry.status]}`}>
                      {entry.status}
                    </span>
                  </div>
                  {entry.detail && <p className="mt-1 break-words">{entry.detail}</p>}
                  {entry.hash && (
                    <a
                      href={transactionUrl(entry.hash, chain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block break-all underline"
                    >
                      {entry.hash}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
