import BrandLogo from './brand-logo'

export default function BrandLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#fcfdfa] z-[9999] transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <BrandLogo height={52} />
      </div>
      <div className="mt-8 w-6 h-6 border-2 border-[#168a6a]/20 border-t-[#168a6a] rounded-full animate-spin"></div>
    </div>
  )
}
