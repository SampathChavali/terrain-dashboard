interface TerrainBackgroundProps {
  children: React.ReactNode
  className?: string
  /** Darker overlay for auth screens — improves text contrast */
  auth?: boolean
}

export function TerrainBackground({ children, className = '', auth = false }: TerrainBackgroundProps) {
  const bgUrl = `${import.meta.env.BASE_URL}terrain-bg.png`

  return (
    <div
      className={`terrain-bg relative ${className}`}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className={auth ? 'terrain-overlay-auth' : 'terrain-overlay'} aria-hidden />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
