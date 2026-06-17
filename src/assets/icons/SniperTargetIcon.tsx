type Props = {
  size?: number
  className?: string
}

export default function SniperTargetIcon({ size = 24, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" className={className} height={size} width={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
  )
}
