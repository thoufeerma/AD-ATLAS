/**
 * Payment marks for the footer's "We accept", inlined like the social icons
 * (components/ui/SocialIcons.tsx) and drawn for the dark plum footer. Each is
 * labelled for screen readers; the drawing itself is decoration.
 */
type Props = { className?: string };

export function Visa({ className }: Props) {
  return (
    <svg viewBox="0 0 60 22" className={className} role="img" aria-label="Visa">
      <text x="30" y="18" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="900" fontStyle="italic" letterSpacing="-0.5" fill="#3d72e4">
        VISA
      </text>
    </svg>
  );
}

/** `named` adds the small "mastercard" wordmark under the circles. */
export function Mastercard({ className, named = false }: Props & { named?: boolean }) {
  return (
    <svg viewBox={named ? "0 0 48 38" : "0 0 48 30"} className={className} role="img" aria-label="Mastercard">
      <circle cx="17" cy="15" r="13" fill="#eb001b" />
      <circle cx="31" cy="15" r="13" fill="#f79e1b" />
      <path d="M24 4.1a13 13 0 0 1 0 21.8 13 13 0 0 1 0-21.8Z" fill="#ff5f00" />
      {named && (
        <text x="24" y="36" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="6.5" fill="#ffffff">
          mastercard
        </text>
      )}
    </svg>
  );
}

export function Upi({ className }: Props) {
  return (
    <svg viewBox="0 0 62 24" className={className} role="img" aria-label="UPI">
      <text x="0" y="19" fontFamily="Arial, Helvetica, sans-serif" fontSize="21" fontWeight="900" fontStyle="italic" letterSpacing="-0.5" fill="#ffffff">
        UPI
      </text>
      {/* The two arrowheads beside the wordmark */}
      <path d="m48 3 9 9-9 9 3-9-3-9Z" fill="#f47920" />
      <path d="m53 3 9 9-9 9 3-9-3-9Z" fill="#26a046" />
    </svg>
  );
}

export function Amex({ className }: Props) {
  return (
    <svg viewBox="0 0 48 30" className={className} role="img" aria-label="American Express">
      <rect width="48" height="30" rx="3" fill="#2e77bc" />
      <text textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="7.6" fontWeight="900" letterSpacing="-0.2" fill="#ffffff">
        <tspan x="24" y="13.5">AMERICAN</tspan>
        <tspan x="24" y="22">EXPRESS</tspan>
      </text>
    </svg>
  );
}

export function Paytm({ className }: Props) {
  return (
    <svg viewBox="0 0 48 30" className={className} role="img" aria-label="Paytm">
      <rect width="48" height="30" rx="3" fill="#ffffff" />
      <text x="24" y="19.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fontWeight="900" letterSpacing="-0.3">
        <tspan fill="#002e6e">pay</tspan>
        <tspan fill="#00baf2">tm</tspan>
      </text>
    </svg>
  );
}
