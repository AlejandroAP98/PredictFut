type Props = {
  size?: number
  className?: string
}

export default function HaramballIcon({ size = 24, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={`icon icon-tabler icons-tabler-outline icon-tabler-alphabet-arabic ${className}`} height={size} strokeWidth={1.25} width={size} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M10 6v4m3 4h8q-2.518-3-4-3m-4-5v9.958c0 .963 0 1.444-.293 1.743S11.943 18 11 18h-1M7 6v9.958c0 .963 0 1.444-.293 1.743S5.943 18 5 18H4"/></svg>
  )
}