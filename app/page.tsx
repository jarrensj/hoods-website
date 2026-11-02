import Image from "next/image";
import { chain } from "@/lib/chain";
import { contractUrl } from "@/lib/contract";
import unrevealed from "@/public/unrevealed.jpg";
import ConnectWallet from "./_components/connect-wallet";
import MintCard from "./_components/mint-card";

const facts = [
  {
    figure: "51",
    title: "Total supply",
    body: "Fixed in the contract. There will never be more than 51 HOODS.",
  },
  {
    figure: "1",
    title: "Per wallet",
    body: "One mint per wallet. Once a wallet has minted, it can't mint again.",
  },
  {
    figure: "?",
    title: "Hidden until reveal",
    body: "Every HOODS shows the same hooded 51 until the art is revealed.",
  },
];

function XLink({ handle, children }: { handle: string; children: React.ReactNode }) {
  return (
    <a
      href={`https://x.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-extrabold underline decoration-2 underline-offset-[5px] hover:decoration-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
    >
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <header className="flex items-center justify-between gap-4 px-6 py-7 md:px-16">
        <span className="text-[22px] font-black uppercase tracking-[-0.02em]">Hoods</span>
        <div className="flex items-center gap-3">
          <span className="hidden whitespace-nowrap rounded-full border-2 border-paper px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] sm:inline-block">
            {chain.name}
          </span>
          <ConnectWallet />
        </div>
      </header>

      {/* HOODS fills the width between the side paddings exactly: Montserrat
          Black "HOODS" at -0.05em is about 3.73em wide. Container units keep a
          scrollbar from pushing it over. */}
      <div className="@container">
        <h1 className="px-6 pt-4 text-center text-[calc(26.8cqw-13px)] font-black uppercase leading-[0.78] tracking-[-0.05em] md:px-16 md:text-[calc(26.8cqw-34px)]">
          Hoods
        </h1>
      </div>

      <section className="grid items-center gap-10 px-6 pt-10 md:grid-cols-2 md:px-16 md:pt-16 lg:grid-cols-[minmax(0,1fr)_45.7%] lg:gap-[72px]">
        <div className="flex min-w-0 flex-col gap-8">
          {/* A byline under the wordmark rather than a second headline: one
              sentence per line, with the names set heavier. */}
          <p className="text-[clamp(20px,2vw,30px)] font-semibold leading-[1.35] tracking-[-0.01em]">
            <span className="block text-balance">
              51 HOODS, drawn by <XLink handle="davidzhorvath">David Horvath</XLink>.
            </span>
            <span className="block text-balance">
              Contract and website by <XLink handle="jarrensj">Jarren</XLink>.
            </span>
          </p>
          <MintCard />
        </div>

        <div className="min-w-0 border-[10px] border-navy shadow-[18px_18px_0_0_var(--navy)]">
          <Image
            src={unrevealed}
            alt="HOODS unrevealed artwork: a black hood with a white 51 on a black background"
            placeholder="blur"
            preload
            sizes="(min-width: 1024px) 46vw, (min-width: 768px) 45vw, 100vw"
            className="block h-auto w-full"
          />
        </div>
      </section>

      <section
        className={`grid gap-[clamp(40px,3.9vw,56px)] px-6 pt-[clamp(80px,8.9vw,128px)] md:grid-cols-3 md:px-16 ${contractUrl ? "" : "pb-[clamp(80px,8.9vw,128px)]"}`}
      >
        {facts.map((fact) => (
          <div key={fact.title} className="border-t-4 border-paper pt-6">
            <p className="font-slab text-[clamp(112px,12.2vw,176px)] leading-[0.9] tracking-[-0.02em]">
              {fact.figure}
            </p>
            <h2 className="mt-6 text-[19px] font-black uppercase tracking-[0.02em]">{fact.title}</h2>
            <p className="mt-2.5 text-pretty text-[17px] font-semibold leading-normal">{fact.body}</p>
          </div>
        ))}
      </section>

      {/* Only once the contract address is set (see lib/contract.ts). */}
      {contractUrl && (
        <div className="flex flex-wrap gap-3 px-6 pb-[clamp(64px,6.7vw,96px)] pt-[clamp(64px,7.8vw,112px)] md:px-16">
          <a
            href={contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-paper px-[22px] py-3.5 text-[13px] font-black uppercase tracking-[0.12em] hover:bg-paper hover:text-evergreen focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
          >
            Contract <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </main>
  );
}
