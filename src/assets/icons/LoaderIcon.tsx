type FlickerSpinnerProps = {
  size?: number
  className?: string
}

export default function FlickerSpinner({ size = 28, className }: FlickerSpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      style={{ '--on': '#F5F5F5', '--off': '#059669', '--dur': '3.300s' } as React.CSSProperties}
    >
      <title>Loading</title>
      <style>{`
        circle { fill: var(--off); }
        circle.on { fill: var(--on); }
        @media (prefers-reduced-motion: reduce) { circle { animation: none !important; } }
        @keyframes f0000111111111111110000 { 0% { opacity: 0; } 18.17% { opacity: 0; } 18.18% { opacity: 1; } 81.81% { opacity: 1; } 81.82% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0000011111111111100000 { 0% { opacity: 0; } 22.72% { opacity: 0; } 22.73% { opacity: 1; } 77.26% { opacity: 1; } 77.27% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0000001111111111000000 { 0% { opacity: 0; } 27.26% { opacity: 0; } 27.27% { opacity: 1; } 72.72% { opacity: 1; } 72.73% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0001111111111111111000 { 0% { opacity: 0; } 13.63% { opacity: 0; } 13.64% { opacity: 1; } 86.35% { opacity: 1; } 86.36% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0000000111100000000000 { 0% { opacity: 0; } 31.81% { opacity: 0; } 31.82% { opacity: 1; } 49.99% { opacity: 1; } 50.00% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0011111111111111111100 { 0% { opacity: 0; } 9.08% { opacity: 0; } 9.09% { opacity: 1; } 90.90% { opacity: 1; } 90.91% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0000000011111110000000 { 0% { opacity: 0; } 36.35% { opacity: 0; } 36.36% { opacity: 1; } 68.17% { opacity: 1; } 68.18% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0000000111111100000000 { 0% { opacity: 0; } 31.81% { opacity: 0; } 31.82% { opacity: 1; } 63.63% { opacity: 1; } 63.64% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes f0111111111111111111110 { 0% { opacity: 0; } 4.54% { opacity: 0; } 4.55% { opacity: 1; } 95.44% { opacity: 1; } 95.45% { opacity: 0; } 100% { opacity: 0; } }
      `}</style>
      <circle cx="3" cy="3" r="2" />
      <circle cx="9" cy="3" r="2" />
      <circle cx="15" cy="3" r="2" />
      <circle cx="21" cy="3" r="2" />
      <circle cx="27" cy="3" r="2" />
      <circle cx="33" cy="3" r="2" />
      <circle cx="39" cy="3" r="2" />
      <circle cx="3" cy="9" r="2" />
      <circle cx="9" cy="9" r="2" />
      <circle cx="15" cy="9" r="2" />
      <circle className="on" cx="15" cy="9" r="2" opacity={0} style={{ animation: 'f0000111111111111110000 var(--dur) linear infinite' }} />
      <circle cx="21" cy="9" r="2" />
      <circle className="on" cx="21" cy="9" r="2" opacity={0} style={{ animation: 'f0000011111111111100000 var(--dur) linear infinite' }} />
      <circle cx="27" cy="9" r="2" />
      <circle className="on" cx="27" cy="9" r="2" opacity={0} style={{ animation: 'f0000001111111111000000 var(--dur) linear infinite' }} />
      <circle cx="33" cy="9" r="2" />
      <circle cx="39" cy="9" r="2" />
      <circle cx="3" cy="15" r="2" />
      <circle cx="9" cy="15" r="2" />
      <circle cx="15" cy="15" r="2" />
      <circle className="on" cx="15" cy="15" r="2" opacity={0} style={{ animation: 'f0001111111111111111000 var(--dur) linear infinite' }} />
      <circle cx="21" cy="15" r="2" />
      <circle cx="27" cy="15" r="2" />
      <circle className="on" cx="27" cy="15" r="2" opacity={0} style={{ animation: 'f0000000111100000000000 var(--dur) linear infinite' }} />
      <circle cx="33" cy="15" r="2" />
      <circle cx="39" cy="15" r="2" />
      <circle cx="3" cy="21" r="2" />
      <circle cx="9" cy="21" r="2" />
      <circle cx="15" cy="21" r="2" />
      <circle className="on" cx="15" cy="21" r="2" opacity={0} style={{ animation: 'f0011111111111111111100 var(--dur) linear infinite' }} />
      <circle cx="21" cy="21" r="2" />
      <circle className="on" cx="21" cy="21" r="2" opacity={0} style={{ animation: 'f0000000011111110000000 var(--dur) linear infinite' }} />
      <circle cx="27" cy="21" r="2" />
      <circle className="on" cx="27" cy="21" r="2" opacity={0} style={{ animation: 'f0000000111111100000000 var(--dur) linear infinite' }} />
      <circle cx="33" cy="21" r="2" />
      <circle cx="39" cy="21" r="2" />
      <circle cx="3" cy="27" r="2" />
      <circle cx="9" cy="27" r="2" />
      <circle cx="15" cy="27" r="2" />
      <circle className="on" cx="15" cy="27" r="2" opacity={0} style={{ animation: 'f0111111111111111111110 var(--dur) linear infinite' }} />
      <circle cx="21" cy="27" r="2" />
      <circle cx="27" cy="27" r="2" />
      <circle cx="33" cy="27" r="2" />
      <circle cx="39" cy="27" r="2" />
      <circle cx="3" cy="33" r="2" />
      <circle cx="9" cy="33" r="2" />
      <circle cx="15" cy="33" r="2" />
      <circle className="on" cx="15" cy="33" r="2" />
      <circle cx="21" cy="33" r="2" />
      <circle cx="27" cy="33" r="2" />
      <circle cx="33" cy="33" r="2" />
      <circle cx="39" cy="33" r="2" />
      <circle cx="3" cy="39" r="2" />
      <circle cx="9" cy="39" r="2" />
      <circle cx="15" cy="39" r="2" />
      <circle cx="21" cy="39" r="2" />
      <circle cx="27" cy="39" r="2" />
      <circle cx="33" cy="39" r="2" />
      <circle cx="39" cy="39" r="2" />
    </svg>
  );
}