interface TerrainBackgroundProps {
  children: React.ReactNode
  className?: string
  /** Darker overlay for auth screens */
  auth?: boolean
  /** Dark glass app shell with light text */
  app?: boolean
}

export function TerrainBackground({
  children,
  className = '',
  auth = false,
  app = false,
}: TerrainBackgroundProps) {
  const bgUrl = `${import.meta.env.BASE_URL}terrain-bg.png`
  const overlayClass = auth ? 'terrain-overlay-auth' : 'terrain-overlay'

  return (
    <div
      className={`terrain-bg relative ${app ? 'terrain-shell' : ''} ${className}`}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className={overlayClass} aria-hidden />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
