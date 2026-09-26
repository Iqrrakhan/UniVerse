import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Star, ArrowRight, Package } from 'lucide-react'

export default function StorefrontCard({ storefront, index = 0 }) {
  const navigate = useNavigate()

  const themeGradient = `linear-gradient(135deg, ${storefront.themeColor || '#f97316'}, ${storefront.accentColor || '#ec4899'})`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/store/${storefront.handle}`)}
      className="group relative rounded-2xl glass-card overflow-hidden cursor-pointer flex flex-col justify-between bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 dark:hover:shadow-cyan-500/10 transition-all duration-300"
    >
      {/* Decorative Banner */}
      <div
        className="h-28 w-full relative overflow-hidden flex items-end p-4 transition-transform duration-500 group-hover:scale-102"
        style={{ background: themeGradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        {/* Category Tag on Banner */}
        {storefront.category && (
          <span className="relative z-10 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md bg-white/90 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100 border border-white/20 shadow-xs">
            {storefront.category.icon} {storefront.category.name}
          </span>
        )}
      </div>

      {/* Avatar Overlay */}
      <div className="px-5 relative -mt-9 flex items-end justify-between">
        <div
          className="w-16 h-16 rounded-2xl border-3 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-xl font-black text-white relative z-10 overflow-hidden"
          style={{ background: themeGradient }}
        >
          {storefront.logoUrl ? (
            <img src={storefront.logoUrl} alt={storefront.displayName} className="w-full h-full object-cover" />
          ) : (
            storefront.displayName?.charAt(0).toUpperCase()
          )}
        </div>

        {/* Rating Pill */}
        {storefront.avgRating && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{storefront.avgRating}</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 pt-3 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-orange-600 dark:group-hover:text-cyan-300 transition-colors truncate">
              {storefront.displayName}
            </h3>
            {storefront.owner?.verificationTier === 'BUSINESS_VERIFIED' && (
              <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-orange-600 dark:text-cyan-400 font-semibold">@{storefront.handle}</p>

          {storefront.tagline && (
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic line-clamp-2">
              "{storefront.tagline}"
            </p>
          )}
        </div>

        {/* Stats & Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
            <Package className="w-3.5 h-3.5 text-orange-500 dark:text-cyan-400" />
            <span>{storefront._count?.products || 0} listings</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-cyan-400 group-hover:text-orange-700 dark:group-hover:text-cyan-300 transition-colors">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
