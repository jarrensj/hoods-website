export default function MintCard() {
  return (
    <div className="ink-panel mt-8 p-6 sm:p-8">
      <dl className="grid grid-cols-3 items-end gap-4 text-center">
        <div>
          <dt className="text-xs font-bold uppercase tracking-widest text-paper/70">Supply</dt>
          <dd className="mt-1 font-slab text-3xl">51</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-widest text-paper/70">Per wallet</dt>
          <dd className="mt-1 font-slab text-3xl">1</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-widest text-paper/70">Price</dt>
          <dd className="mt-1 font-slab text-3xl">TBA</dd>
        </div>
      </dl>
      <button
        type="button"
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-md bg-paper py-4 text-lg font-black uppercase tracking-wide text-ink"
      >
        Mint opens soon
      </button>
    </div>
  );
}
