/**
 * Payment marks for the footer's "We accept", inlined like the social icons
 * (components/ui/SocialIcons.tsx) and drawn for the dark plum footer. Each is
 * labelled for screen readers; the drawing itself is decoration.
 */
type Props = { className?: string };

export function Visa({ className }: Props) {
  return (
    <svg
      width="54"
      height="18"
      viewBox="0 8 24 8"
      className={className}
      role="img"
      aria-label="Visa"
    >
      <path
        d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
        fill="#3d72e4"
      />
    </svg>
  );
}

/** `named` adds the small "mastercard" wordmark under the circles. */
export function Mastercard({ className, named = false }: Props & { named?: boolean }) {
  return (
    <svg
      width="48"
      height={named ? "38" : "30"}
      viewBox={named ? "0 0 48 38" : "0 0 48 30"}
      className={className}
      role="img"
      aria-label="Mastercard"
    >
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
    <svg
      width="62"
      height="24"
      viewBox="0 0 62 24"
      className={className}
      role="img"
      aria-label="UPI"
    >
      <path
        d="M6.8 4.2V12.7C6.8 14.7 7.9 15.8 9.9 15.8C11.9 15.8 13 14.7 13 12.7V4.2H17.2V12.7C17.2 17.3 14.5 19.8 9.9 19.8C5.3 19.8 2.6 17.3 2.6 12.7V4.2H6.8ZM21.5 4.2H28.4C32.1 4.2 34.3 6.1 34.3 9.3C34.3 12.5 32.1 14.4 28.4 14.4H25.7V19.8H21.5V4.2ZM25.7 10.7H28.1C29.4 10.7 30.1 10.2 30.1 9.3C30.1 8.4 29.4 7.9 28.1 7.9H25.7V10.7ZM38.4 4.2H42.6V19.8H38.4V4.2Z"
        fill="currentColor"
      />
      {/* The two arrowheads beside the wordmark */}
      <path d="m48 3 9 9-9 9 3-9-3-9Z" fill="#f47920" />
      <path d="m53 3 9 9-9 9 3-9-3-9Z" fill="#26a046" />
    </svg>
  );
}

export function Amex({ className }: Props) {
  return (
    <svg
      width="48"
      height="30"
      viewBox="0 0 48 30"
      className={className}
      role="img"
      aria-label="American Express"
    >
      <rect width="48" height="30" rx="3" fill="#2e77bc" />
      <text
        textAnchor="middle"
        x="24"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="7.6"
        fontWeight="900"
        letterSpacing="-0.2"
        fill="#ffffff"
      >
        <tspan x="24" y="13.5">AMERICAN</tspan>
        <tspan x="24" y="22">EXPRESS</tspan>
      </text>
    </svg>
  );
}

export function Paytm({ className }: Props) {
  return (
    <svg
      width="48"
      height="30"
      viewBox="0 0 48 30"
      className={className}
      role="img"
      aria-label="Paytm"
    >
      <rect width="48" height="30" rx="3" fill="#ffffff" />
      <text
        x="24"
        y="19.5"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13"
        fontWeight="900"
        letterSpacing="-0.3"
      >
        <tspan fill="#002e6e">pay</tspan>
        <tspan fill="#00baf2">tm</tspan>
      </text>
    </svg>
  );
}

export function Razorpay({ className }: Props) {
  return (
    <svg
      width="85"
      height="24"
      viewBox="0 0 85 24"
      className={className}
      role="img"
      aria-label="Razorpay"
    >
      <text
        x="0"
        y="18"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fontWeight="800"
        letterSpacing="-0.5"
        fill="#02042b"
      >
        Razorpay
      </text>
    </svg>
  );
}
