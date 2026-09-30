"use client";

export function RapSheetView() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="mono text-[14px] font-semibold mb-1">RAP SHEET</h2>
      <p className="mono text-[11px] text-[#8a8a93] mb-4">
        Deployers ranked by launch outcomes
      </p>
      <input className="desk-input mb-4" placeholder="Search wallet / creator" disabled />
      <div className="border border-[#1e1e22] rounded p-4 mono text-[11px] text-[#8a8a93]">
        Creator kill-rate and serial-launcher ranking need a Solana launch indexer.
        <div className="mt-3 text-[#52525b]">STATE · INDEXER NOT CONNECTED</div>
      </div>
    </div>
  );
}
