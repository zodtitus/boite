"use client"

interface BoxProps {
  solved: [boolean, boolean, boolean]
  isOpening: boolean
  isOpen: boolean
}

export default function Box({ solved, isOpening, isOpen }: BoxProps) {
  const allSolved = solved.every(Boolean)

  return (
    <div className="relative flex flex-col items-center">
      {/* Box container with float animation */}
      <div
        className="relative"
        style={{
          animation: isOpening
            ? "boxTremble 0.6s ease-in-out"
            : "float 4s ease-in-out infinite",
          filter: allSolved
            ? "drop-shadow(0 0 32px rgba(200,169,110,0.45))"
            : "drop-shadow(0 0 12px rgba(200,169,110,0.12))",
          transition: "filter 1s ease",
        }}
      >
        {/* SVG Box */}
        <svg
          width="220"
          height="180"
          viewBox="0 0 220 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1510" />
              <stop offset="100%" stopColor="#0a0806" />
            </linearGradient>
            <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#201a12" />
              <stop offset="100%" stopColor="#120e08" />
            </linearGradient>
            <linearGradient id="goldEdge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#604020" />
              <stop offset="40%" stopColor="#c8a96e" />
              <stop offset="60%" stopColor="#c8a96e" />
              <stop offset="100%" stopColor="#604020" />
            </linearGradient>
            <linearGradient id="goldEdgeV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#604020" />
              <stop offset="40%" stopColor="#c8a96e" />
              <stop offset="60%" stopColor="#c8a96e" />
              <stop offset="100%" stopColor="#604020" />
            </linearGradient>
            <filter id="goldGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Lid — animates open */}
          <g
            style={{
              transformOrigin: "110px 55px",
              animation: isOpen ? "lidOpen 1.2s cubic-bezier(0.4,0,0.2,1) forwards" : "none",
            }}
          >
            {/* Lid body */}
            <rect x="15" y="55" width="190" height="30" rx="3" fill="url(#lidGrad)" />
            {/* Lid top bevel */}
            <rect x="18" y="58" width="184" height="6" rx="2" fill="#1a1510" opacity="0.5" />
            {/* Gold border top */}
            <rect x="15" y="55" width="190" height="2" fill="url(#goldEdge)" />
            {/* Gold border bottom of lid */}
            <rect x="15" y="83" width="190" height="1.5" fill="url(#goldEdge)" />
            {/* Gold corners */}
            <rect x="15" y="55" width="2" height="30" fill="url(#goldEdgeV)" />
            <rect x="203" y="55" width="2" height="30" fill="url(#goldEdgeV)" />

            {/* Decorative gold ornament on lid center */}
            <g transform="translate(110, 70)">
              {/* Diamond */}
              <polygon points="0,-10 8,0 0,10 -8,0" fill="none" stroke="#c8a96e" strokeWidth="1" opacity="0.8" />
              <polygon points="0,-5 4,0 0,5 -4,0" fill="#c8a96e" opacity="0.4" />
              {/* Horizontal lines */}
              <line x1="-30" y1="0" x2="-12" y2="0" stroke="#a07840" strokeWidth="0.8" opacity="0.7" />
              <line x1="12" y1="0" x2="30" y2="0" stroke="#a07840" strokeWidth="0.8" opacity="0.7" />
            </g>

            {/* Tengetsu kanji 天月 on lid */}
            <text
              x="110"
              y="75"
              textAnchor="middle"
              fill="#c8a96e"
              fontSize="11"
              fontFamily="var(--font-cinzel-var), Cinzel, serif"
              letterSpacing="4"
              opacity="0.6"
            >
              天月
            </text>
          </g>

          {/* Box body */}
          <rect x="15" y="84" width="190" height="88" rx="3" fill="url(#boxGrad)" />

          {/* Side panels texture */}
          <rect x="18" y="87" width="184" height="82" rx="2" fill="none" stroke="#1a1510" strokeWidth="1" opacity="0.8" />

          {/* Gold frame edges */}
          <rect x="15" y="84" width="190" height="2" fill="url(#goldEdge)" />
          <rect x="15" y="170" width="190" height="2" fill="url(#goldEdge)" />
          <rect x="15" y="84" width="2" height="88" fill="url(#goldEdgeV)" />
          <rect x="203" y="84" width="2" height="88" fill="url(#goldEdgeV)" />

          {/* Decorative corner brackets */}
          {[
            [15, 84], [203, 84], [15, 170], [203, 170],
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx}, ${cy})`}>
              <rect
                x={i % 2 === 0 ? 0 : -8}
                y={i < 2 ? 0 : -8}
                width="8"
                height="8"
                fill="none"
                stroke="#c8a96e"
                strokeWidth="1.5"
                opacity="0.7"
              />
            </g>
          ))}

          {/* Center decorative panel */}
          <rect x="40" y="100" width="140" height="58" rx="2" fill="none" stroke="#a07840" strokeWidth="0.6" opacity="0.4" />
          <rect x="44" y="104" width="132" height="50" rx="2" fill="none" stroke="#604020" strokeWidth="0.4" opacity="0.3" />

          {/* Water motif in center panel */}
          <g transform="translate(110, 129)" opacity="0.25">
            {/* Wave lines */}
            <path d="M-30 -8 Q-15 -14 0 -8 Q15 -2 30 -8" stroke="#2a6090" strokeWidth="1.5" fill="none" />
            <path d="M-30 0 Q-15 -6 0 0 Q15 6 30 0" stroke="#2a6090" strokeWidth="1.2" fill="none" />
            <path d="M-30 8 Q-15 2 0 8 Q15 14 30 8" stroke="#2a6090" strokeWidth="0.9" fill="none" />
          </g>

          {/* 3 lock slots */}
          {[65, 110, 155].map((x, i) => (
            <g key={i} transform={`translate(${x}, 155)`}>
              {/* Lock outline */}
              <rect x="-12" y="-12" width="24" height="20" rx="3" fill="#0a0806" stroke={solved[i] ? "#c8a96e" : "#403020"} strokeWidth="1.5" />
              {/* Keyhole */}
              {!solved[i] ? (
                <g opacity="0.6">
                  <circle cx="0" cy="-4" r="4" fill="none" stroke="#604020" strokeWidth="1" />
                  <rect x="-2" y="-2" width="4" height="6" rx="1" fill="#604020" />
                </g>
              ) : (
                /* Solved: glowing check */
                <g>
                  <circle cx="0" cy="-2" r="6" fill="rgba(200,169,110,0.15)" />
                  <path d="M-3 -2 L-0.5 1 L4 -4" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {allSolved && (
                    <circle cx="0" cy="-2" r="8" fill="none" stroke="#c8a96e" strokeWidth="0.8" opacity="0.5"
                      style={{ animation: "goldPulse 2s ease-in-out infinite" }} />
                  )}
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Golden light burst when open */}
        {isOpen && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <div
              style={{
                width: "4px",
                height: "120px",
                background: "linear-gradient(to bottom, rgba(200,169,110,0.9), transparent)",
                borderRadius: "2px",
                animation: "goldLight 1.5s ease-out forwards",
                position: "absolute",
                top: "30px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
