function Glow({ color, id }: { color: string; id: string }) {
  return (
    <>
      <defs>
        <filter id={`${id}-blur`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <ellipse
        cx="20"
        cy="24"
        rx="13"
        ry="9"
        fill={color}
        opacity="0.35"
        filter={`url(#${id}-blur)`}
      />
    </>
  );
}

export function CategoriesIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <linearGradient id="cat-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb3ad" />
          <stop offset="100%" stopColor="#ff8a80" />
        </linearGradient>
        <linearGradient id="cat-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6f68" />
          <stop offset="100%" stopColor="#e6453f" />
        </linearGradient>
      </defs>
      <Glow color="#ff6f68" id="cat" />
      <rect x="11" y="8" width="14" height="9" rx="2.5" fill="url(#cat-a)" />
      <rect x="7" y="14" width="26" height="19" rx="4" fill="url(#cat-b)" />
      <rect x="19" y="24" width="9" height="3.4" rx="1.7" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function RankingIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <linearGradient id="rank-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c6b6f2" />
          <stop offset="100%" stopColor="#9c86e0" />
        </linearGradient>
        <linearGradient id="rank-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a6fd6" />
          <stop offset="100%" stopColor="#6b4fc4" />
        </linearGradient>
      </defs>
      <Glow color="#8a6fd6" id="rank" />
      <rect x="13" y="10" width="18" height="22" rx="3.5" fill="url(#rank-a)" />
      <rect x="8" y="12" width="18" height="22" rx="3.5" fill="url(#rank-b)" />
      <text
        x="17"
        y="27"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#fff"
      >
        IP
      </text>
    </svg>
  );
}

export function FreeIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <linearGradient id="free-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8ee6ad" />
          <stop offset="100%" stopColor="#4fbf7a" />
        </linearGradient>
        <linearGradient id="free-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5fd48c" />
          <stop offset="100%" stopColor="#34a866" />
        </linearGradient>
      </defs>
      <Glow color="#4fbf7a" id="free" />
      <path
        d="M20 6 C21 11 25 12 26 16 C21 16 18 13 18 9 C18 8 19 6.5 20 6 Z"
        fill="url(#free-a)"
      />
      <path
        d="M19 8 C17 12 12 12 10 16 C15 17 19 14 19 10 C19 9.4 19 8.6 19 8 Z"
        fill="url(#free-a)"
      />
      <rect x="10" y="16" width="20" height="17" rx="4" fill="url(#free-b)" />
      <rect x="15" y="23" width="10" height="3" rx="1.5" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function CompletedIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <linearGradient id="comp-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8fc2ff" />
          <stop offset="100%" stopColor="#5b9be6" />
        </linearGradient>
        <linearGradient id="comp-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f8fe0" />
          <stop offset="100%" stopColor="#2f6dc4" />
        </linearGradient>
      </defs>
      <Glow color="#4f8fe0" id="comp" />
      <rect x="16" y="9" width="16" height="24" rx="3" fill="url(#comp-a)" />
      <rect x="8" y="9" width="16" height="24" rx="3" fill="url(#comp-b)" />
      <path d="M12 9 h6 v8 l-3 -2.4 L12 17 Z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function AuthorsIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <linearGradient id="auth-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd580" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <Glow color="#f5a623" id="auth" />
      <path
        d="M8 26 L11 13 L17 20 L20 10 L23 20 L29 13 L32 26 Z"
        fill="url(#auth-a)"
        strokeLinejoin="round"
      />
      <rect x="8" y="26" width="24" height="4" rx="1.5" fill="url(#auth-a)" />
      <circle cx="20" cy="19" r="2.4" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function BooklistsIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <linearGradient id="book-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fe3cf" />
          <stop offset="100%" stopColor="#3fb9a3" />
        </linearGradient>
      </defs>
      <Glow color="#3fb9a3" id="book" />
      <path
        d="M10 8 h16 a3 3 0 0 1 3 3 v16 l-6 6 h-13 a3 3 0 0 1 -3 -3 v-19 a3 3 0 0 1 3 -3 Z"
        fill="url(#book-a)"
      />
      <path d="M29 27 l-6 6 v-4.5 a1.5 1.5 0 0 1 1.5 -1.5 Z" fill="#ffffff" opacity="0.55" />
      <rect x="14" y="16" width="10" height="2.4" rx="1.2" fill="#fff" opacity="0.9" />
      <rect x="14" y="21" width="7" height="2.4" rx="1.2" fill="#fff" opacity="0.9" />
    </svg>
  );
}
