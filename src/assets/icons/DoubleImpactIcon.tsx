type Props = {
  size?: number
  className?: string
}

export default function DoubleImpactIcon({ size = 24, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={`icon icon-tabler icons-tabler-outline icon-tabler-ball-football ${className} `} height={size} strokeWidth={1.25} width={size} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0"/><path d="M12 7l4.76 3.45-1.76 5.55h-6l-1.76-5.55 4.76-3.45"/><path d="M12 7v-4m3 13l2.5 3m-.74-8.55l3.74-1.45m-11.44 7.05l-2.56 2.95m.74-8.55l-3.74-1.45"/></svg>
  )
}
