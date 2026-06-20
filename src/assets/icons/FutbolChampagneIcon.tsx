type Props = {
  size?: number
  className?: string
}

export default function FutbolChampagneIcon({ size = 24, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={`icon icon-tabler icons-tabler-outline icon-tabler-glass-champagne ${className}`} height={size} strokeWidth={1.25} width={size} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M9 21h6m-3-5v5M8 5a4 2 0 1 0 8 0 4 2 0 1 0-8 0"/><path d="M8 5c0 6.075 1.79 11 4 11s4-4.925 4-11"/></svg>
  )
}