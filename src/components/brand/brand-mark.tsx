/**
 * BrandMark — Brand Mark / Icon only (SVG resmi)
 * Gunakan di: collapsed sidebar, mobile header, favicon, PWA icon, loading indicator.
 *
 * Aturan:
 * - Jangan ubah warna, jangan stretch, pertahankan aspect ratio
 * - Gunakan object-fit: contain
 * - Ukuran minimum digital: 24px
 */

interface BrandMarkProps {
  size?: number
  className?: string
  alt?: string
}

export default function BrandMark({
  size = 32,
  className = '',
  alt = 'AGREGO'
}: BrandMarkProps) {
  return (
    <img
      src="/brand/agrego-brand-mark.svg"
      alt={alt}
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0
      }}
      className={className}
      draggable={false}
    />
  )
}
