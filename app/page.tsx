import Image from "next/image";
import unrevealed from "@/public/unrevealed.jpg";
import MintCard from "./_components/mint-card";

const facts = [
  {
    figure: "51",
    title: "Total supply",
    body: "The supply is fixed in the contract. There will never be more than 51 HOODS.",
  },
  {
    figure: "1",
    title: "Per transaction",
    body: "Each mint is one HOOD. Want another? Mint again.",
  },
  {
    figure: "?",
    title: "Hidden until reveal",
    body: "Every HOODS show the same hooded 51 until the art is revealed.",
  },
];

function XLink({ handle, children }: { handle: string; children: React.ReactNode }) {
  return (
    <a
      href={`https://x.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-2 underline-offset-4 hover:decoration-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-6">
        <span className="text-2xl font-black uppercase tracking-tight text-paper">Hoods</span>
        <span className="rounded-full border-2 border-paper/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-paper">
          Robinhood Chain
        </span>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div className="mx-auto w-full max-w-xs -rotate-2 border-[6px] border-ink shadow-[10px_10px_0_0_var(--ink)] sm:max-w-md">
          <Image
            src={unrevealed}
            alt="HOODS unrevealed artwork: a black hood with a white 51 on a red background"
            placeholder="blur"
            preload
            sizes="(min-width: 640px) 28rem, 20rem"
          />
        </div>

        <div>
          <h1 className="text-[clamp(4.5rem,18vw,9rem)] font-black uppercase leading-[0.85] tracking-tight md:text-[clamp(4.5rem,11vw,8.5rem)]">
            Hoods
          </h1>
          <p className="mt-4 text-lg font-semibold">
            <span className="whitespace-nowrap">
              51 HOODS, drawn by <XLink handle="davidzhorvath">David Horvath</XLink>.
            </span>{" "}
            <span className="whitespace-nowrap">
              Contract by <XLink handle="jarrensj">Jarren</XLink>.
            </span>
          </p>
          <MintCard />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.title} className="ink-panel p-6">
            <p className="font-slab text-6xl leading-none">{fact.figure}</p>
            <h2 className="mt-4 text-lg font-black uppercase">{fact.title}</h2>
            <p className="mt-2 text-paper/80">{fact.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
