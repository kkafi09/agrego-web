/**
 * BrandLogo — Primary Logo (SVG resmi)
 * Gunakan di: expanded sidebar, auth pages, landing page, brand presentation.
 *
 * Aturan:
 * - Jangan ubah warna, jangan stretch, pertahankan aspect ratio
 * - Gunakan object-fit: contain
 * - Ukuran minimum digital: 24px height
 */

interface BrandLogoProps {
  height?: number
  className?: string
  alt?: string
}

export default function BrandLogo({
  height = 36,
  className = '',
  alt = 'AGREGO — Collective Supply Platform'
}: BrandLogoProps) {
  return (
    <img
      src="/brand/agrego-primary-logo.svg"
      alt={alt}
      height={height}
      style={{
        height: `${height}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0
      }}
      className={className}
      draggable={false}
    />
  )
}
