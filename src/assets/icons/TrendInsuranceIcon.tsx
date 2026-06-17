type Props = {
  size?: number
  className?: string
}

export default function TrendInsuranceIcon({ size = 24, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"   fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={`${className} "icon icon-tabler icons-tabler-outline icon-tabler-peace" `} height={size} strokeWidth={1.25} width={size} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0m9-9v18m0-9 6.3 6.3M12 12l-6.3 6.3"/></svg>
  )
}
