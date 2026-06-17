type Props = {
  size?: number
  className?: string
}

export default function HandOfGodIcon({ size = 24, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={`icon icon-tabler icons-tabler-outline icon-tabler-play-handball ${className} `} height={size} strokeWidth={1.25} width={size} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="m13 21 3.5-2-4.5-4 2-4.5"/><path d="m5 7 4 3 5 .5 4 2.5 2.5 3M4 20l5-1 1.5-2m2.507-9a2 2 0 1 0 4 0 2 2 0 1 0-4 0m-7-4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"/></svg>
  )
}
