const SUPPLY = 51;

const stats = [
  { label: "Supply", value: String(SUPPLY) },
  { label: "Per wallet", value: "1" },
  { label: "Price (ETH)", value: "0.0333" },
];

// The mint hasn't opened, so nothing is minted yet. The count will come from
// the contract once it is deployed.
const minted = 0;

export default function MintCard() {
  return (
    <div className="bg-navy p-6 text-paper sm:p-8">
      <dl className="grid grid-cols-3 items-end gap-4">
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
            {minted} of {SUPPLY} minted
          </span>
          <span className="text-mist">{SUPPLY - minted} left</span>
        </div>
        <div
          role="progressbar"
          aria-label="HOODS minted"
          aria-valuemin={0}
          aria-valuemax={SUPPLY}
          aria-valuenow={minted}
          className="h-1.5 bg-forest"
        >
          <div className="h-full bg-leaf" style={{ width: `${(minted / SUPPLY) * 100}%` }} />
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-7 w-full cursor-not-allowed bg-paper py-[22px] text-lg font-black uppercase tracking-[0.06em] text-navy"
      >
        Mint opens soon
      </button>
    </div>
  );
}
