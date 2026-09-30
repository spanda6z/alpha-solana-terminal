"use client";

/** ALPHA mark — angular A in a hex shield. Not Nlyra infinity. */
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
      <defs>
        <linearGradient id="ag" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5L28 9.5V22.5L16 29.5L4 22.5V9.5L16 2.5Z"
        stroke="url(#ag)"
        strokeWidth="1.5"
        fill="#12121a"
      />
      <path
        d="M16 8L22 24H19.2L17.8 19.5H14.2L12.8 24H10L16 8ZM15.1 17H16.9L16 14.2L15.1 17Z"
        fill="url(#ag)"
      />
    </svg>
  );
}

export function AlphaWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-[0.18em] text-[13px] text-[#f4f4f8] ${className}`}>
      ALPHA
    </span>
  );
}
