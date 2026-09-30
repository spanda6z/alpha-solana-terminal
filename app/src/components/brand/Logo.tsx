"use client";

/** SOLBIT mark — angular S block */
export function AlphaMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="2" width="28" height="28" rx="6" fill="#12121a" stroke="#f59e0b" strokeWidth="1.5" />
      <path
        d="M10 11.5C10 10.1 11.2 9 13.2 9H19C20.7 9 22 10 22 11.4C22 12.7 21 13.5 19.2 13.8L13.5 15.1C12.2 15.4 11.5 15.9 11.5 16.8C11.5 17.9 12.5 18.7 14 18.7H19.5C20.8 18.7 21.8 17.9 21.8 16.7"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M16 8V24" stroke="#f59e0b" strokeWidth="1.2" opacity="0.35" />
    </svg>
  );
}

export function AlphaWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`leading-tight ${className}`}>
      <span className="block font-semibold tracking-[0.14em] text-[12px] text-[#f4f4f8]">
        SOLBIT
      </span>
      <span className="block text-[8px] tracking-[0.12em] text-[#5e5e70] font-medium">
        DIGITAL ASSET MARKET TERMINAL
      </span>
    </span>
  );
}
