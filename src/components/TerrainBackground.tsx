interface TerrainBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function TerrainBackground({ children, className = '' }: TerrainBackgroundProps) {
  const bgUrl = `${import.meta.env.BASE_URL}terrain-bg.png`

  return (
    <div
      className={`terrain-bg relative ${className}`}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className="terrain-overlay" aria-hidden />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
