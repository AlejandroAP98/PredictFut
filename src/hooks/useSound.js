import { useRef, useCallback, useEffect } from 'react'

export function useSound(url, options = {}) {
  const { volume = 1, loop = false } = options
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio(url)
    audio.preload = 'auto'
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [url])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.loop = loop
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [volume, loop])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }, [])

  return [play, stop]
}
