import React from "react";

export function TransparencyBadge({
  className = "size-36 sm:size-44 min-[1000px]:size-[12.8vw] min-[1400px]:size-[185px]",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative select-none transition-transform duration-500 hover:scale-105 shrink-0 ${className}`}
      aria-label="Transparency Is Our Promise"
    >
      <svg
        viewBox="0 0 320 320"
        className="size-full overflow-visible drop-shadow-[0_14px_32px_rgba(0,0,0,0.52)]"
      >
        <defs>
          {/* Deep Royal Plum Velvet Radial Gradient */}
          <radialGradient id="badgeBgGrad" cx="50%" cy="47%" r="56%">
            <stop offset="0%" stopColor="#3d0b47" />
            <stop offset="38%" stopColor="#25052e" />
            <stop offset="75%" stopColor="#15021c" />
            <stop offset="100%" stopColor="#08000a" />
          </radialGradient>

          {/* Outer Metallic Gold Ring Gradient (Rich multi-stop bevel & reflection) */}
          <linearGradient id="goldRingOuter" x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#fff9e8" />
            <stop offset="12%" stopColor="#f7d479" />
            <stop offset="28%" stopColor="#b37c26" />
            <stop offset="42%" stopColor="#fdf0b8" />
            <stop offset="58%" stopColor="#986018" />
            <stop offset="76%" stopColor="#f3cc6c" />
            <stop offset="88%" stopColor="#9e6519" />
            <stop offset="100%" stopColor="#fff5da" />
          </linearGradient>

          {/* Inner Metallic Gold Ring Gradient */}
          <linearGradient id="goldRingInner" x1="85%" y1="85%" x2="15%" y2="15%">
            <stop offset="0%" stopColor="#fffaec" />
            <stop offset="16%" stopColor="#eec765" />
            <stop offset="38%" stopColor="#8d5612" />
            <stop offset="60%" stopColor="#fde7a6" />
            <stop offset="82%" stopColor="#aa7422" />
            <stop offset="100%" stopColor="#fff7dc" />
          </linearGradient>

          {/* Bright Champagne Gold for Crisp Sans-Serif Text & Rules */}
          <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fff3ce" />
            <stop offset="70%" stopColor="#f5d688" />
            <stop offset="100%" stopColor="#d8a74e" />
          </linearGradient>

          {/* Shimmering Metallic Gold Bevel for "PROMISE" */}
          <linearGradient id="goldPromise" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#fbf0c2" />
            <stop offset="46%" stopColor="#f1c360" />
            <stop offset="76%" stopColor="#b47b25" />
            <stop offset="92%" stopColor="#e9b74e" />
            <stop offset="100%" stopColor="#fff6d7" />
          </linearGradient>

          {/* Star Flare Glow */}
          <radialGradient id="starHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#ffebb0" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#d8a442" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d8a442" stopOpacity="0" />
          </radialGradient>

          {/* Text Depth Shadow for High Legibility */}
          <filter id="goldShadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="1.8" stdDeviation="1.2" floodColor="#040005" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* 1. Base Medallion Circle */}
        <circle cx="160" cy="160" r="142" fill="url(#badgeBgGrad)" />

        {/* Subtle inner ambient ring */}
        <circle cx="160" cy="160" r="141.5" fill="none" stroke="#fed885" strokeWidth="0.6" opacity="0.2" />

        {/* 2. Outer Heavy Gold Ring */}
        <circle
          cx="160"
          cy="160"
          r="133"
          fill="none"
          stroke="url(#goldRingOuter)"
          strokeWidth="3.2"
        />

        {/* 3. Inner Delicate Gold Ring */}
        <circle
          cx="160"
          cy="160"
          r="126"
          fill="none"
          stroke="url(#goldRingInner)"
          strokeWidth="1.3"
        />

        {/* 4. Top-Left Sparkle Star Lens Flare (at ~10:30 on the ring) */}
        <g transform="translate(69, 73)">
          {/* Radiant Halo */}
          <circle cx="0" cy="0" r="18" fill="url(#starHalo)" />
          {/* Vertical Flare (taller) */}
          <path
            d="M 0 -26 Q 0.6 0 5 0 Q 0.6 0 0 26 Q -0.6 0 -5 0 Q -0.6 0 0 -26 Z"
            fill="url(#goldRingOuter)"
          />
          {/* Horizontal Flare */}
          <path
            d="M -18 0 Q 0 0.6 0 4.5 Q 0 0.6 18 0 Q 0 -0.6 0 -4.5 Q 0 -0.6 -18 0 Z"
            fill="url(#goldRingOuter)"
          />
          {/* Diagonal tiny cross flares */}
          <path
            d="M -7 -7 L 7 7 M -7 7 L 7 -7"
            stroke="#fff9df"
            strokeWidth="0.8"
            opacity="0.65"
          />
          {/* Center pinpoint brilliant light */}
          <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
        </g>

        {/* Top-Left Satellite Sparkles */}
        <g transform="translate(47, 76)">
          <path
            d="M 0 -7 Q 0.3 0 2 0 Q 0.3 0 0 7 Q -0.3 0 -2 0 Q -0.3 0 0 -7 Z"
            fill="#ffefa8"
          />
          <path
            d="M -6 0 Q 0 0.3 0 1.8 Q 0 0.3 6 0 Q 0 -0.3 0 -1.8 Q 0 -0.3 -6 0 Z"
            fill="#ffefa8"
          />
          <circle cx="0" cy="0" r="1.1" fill="#ffffff" />
        </g>
        <circle cx="97" cy="61" r="1.3" fill="#ffeaa3" opacity="0.9" />

        {/* 5. Bottom-Right Sparkle Star Lens Flare (at ~4:30 on the ring) */}
        <g transform="translate(251, 247)">
          {/* Radiant Halo */}
          <circle cx="0" cy="0" r="16" fill="url(#starHalo)" />
          {/* Vertical Flare */}
          <path
            d="M 0 -23 Q 0.6 0 4.5 0 Q 0.6 0 0 23 Q -0.6 0 -4.5 0 Q -0.6 0 0 -23 Z"
            fill="url(#goldRingOuter)"
          />
          {/* Horizontal Flare */}
          <path
            d="M -16 0 Q 0 0.6 0 4 Q 0 0.6 16 0 Q 0 -0.6 0 -4 Q 0 -0.6 -16 0 Z"
            fill="url(#goldRingOuter)"
          />
          {/* Center pinpoint light */}
          <circle cx="0" cy="0" r="2" fill="#ffffff" />
        </g>

        {/* Bottom-Right Satellite Sparkles */}
        <g transform="translate(269, 249)">
          <path
            d="M 0 -6 Q 0.3 0 1.8 0 Q 0.3 0 0 6 Q -0.3 0 -1.8 0 Q -0.3 0 0 -6 Z"
            fill="#ffefa8"
          />
          <path
            d="M -5 0 Q 0 0.3 0 1.6 Q 0 0.3 5 0 Q 0 -0.3 0 -1.6 Q 0 -0.3 -5 0 Z"
            fill="#ffefa8"
          />
          <circle cx="0" cy="0" r="0.9" fill="#ffffff" />
        </g>
        <circle cx="242" cy="272" r="1.2" fill="#ffeaa3" opacity="0.85" />

        {/* 6. Typography & Internal Details (Enlarged & High-Contrast for Enhanced Readability) */}

        {/* Line 1: TRANSPARENCY (Bigger, bolder & cleanly tracked) */}
        <text
          x="160"
          y="107"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif"
          fontSize="16.5"
          fontWeight="700"
          letterSpacing="0.22em"
          fill="url(#goldText)"
          filter="url(#goldShadow)"
        >
          TRANSPARENCY
        </text>

        {/* Line 2: — IS OUR — */}
        <g filter="url(#goldShadow)">
          {/* Left Hairline Rule */}
          <line
            x1="76"
            y1="131"
            x2="114"
            y2="131"
            stroke="url(#goldText)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* IS OUR Text (Bigger, bolder) */}
          <text
            x="160"
            y="136"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif"
            fontSize="13.5"
            fontWeight="700"
            letterSpacing="0.22em"
            fill="url(#goldText)"
          >
            IS OUR
          </text>
          {/* Right Hairline Rule */}
          <line
            x1="206"
            y1="131"
            x2="244"
            y2="131"
            stroke="url(#goldText)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </g>

        {/* Line 3: PROMISE (Grand, prominent serif in shimmering gold) */}
        <text
          x="160"
          y="188"
          textAnchor="middle"
          fontFamily="'Playfair Display', Didot, 'Bodoni MT', 'Times New Roman', serif"
          fontSize="45"
          fontWeight="700"
          letterSpacing="0.04em"
          fill="url(#goldPromise)"
          filter="url(#goldShadow)"
        >
          PROMISE
        </text>

        {/* Line 4: — ♡ — */}
        <g filter="url(#goldShadow)">
          {/* Left Hairline Rule */}
          <line
            x1="84"
            y1="223"
            x2="136"
            y2="223"
            stroke="url(#goldText)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* Hand-drawn Script Outline Heart (Enhanced stroke & scale) */}
          <path
            d="M 159.8 214.5 
               C 158.2 208 150.5 204 144 207.5 
               C 137.5 211 137.5 220 143.5 228 
               C 148.5 234.5 157.8 242 160.6 245
               C 162.2 242 171 234 176 227.5 
               C 181.5 220.5 181 211 175 207.5 
               C 168.5 204 161.5 208 159.8 214.5 Z"
            fill="none"
            stroke="url(#goldText)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Hairline Rule */}
          <line
            x1="184"
            y1="223"
            x2="236"
            y2="223"
            stroke="url(#goldText)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}


