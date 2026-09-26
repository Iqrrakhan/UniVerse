import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, CheckCircle2, Package, Zap, Layers, Tag, Sparkles } from 'lucide-react'

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate()

  const getProductImage = (p) => p.images?.[0]?.url || null

  const handleNavigate = () => {
    if (product.storefront?.handle) {
      navigate(`/store/${product.storefront.handle}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.25), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      onClick={handleNavigate}
      className="group relative flex flex-col rounded-2xl glass-card overflow-hidden cursor-pointer bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 dark:hover:shadow-cyan-500/10 hover:border-orange-300 dark:hover:border-cyan-400/50 transition-all duration-300"
    >
      {/* Light/Dark Hover Top Tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Image Container */}
      <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-950/70 overflow-hidden flex items-center justify-center">
        {getProductImage(product) ? (
          <img
            src={getProductImage(product)}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 select-none">
            <Package className="w-12 h-12 stroke-[1.5] group-hover:scale-110 transition-transform duration-300 text-orange-400/80" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              {product.category?.name || 'Listing'}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/95 dark:bg-slate-900/85 text-orange-600 dark:text-cyan-300 border border-orange-200/80 dark:border-cyan-500/30 shadow-xs">
            <Tag className="w-3 h-3 text-orange-500" />
            <span>{product.category?.name || 'Item'}</span>
          </span>

          {/* Type Badge */}
          {product.itemType !== 'PHYSICAL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-purple-50/95 dark:bg-purple-950/85 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30 shadow-xs">
              {product.itemType === 'SERVICE' ? (
                <>
                  <Zap className="w-3 h-3 text-purple-600" />
                  <span>Service</span>
                </>
              ) : (
                <>
                  <Layers className="w-3 h-3 text-purple-600" />
                  <span>Digital</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/70 dark:bg-slate-950/75 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-200 border border-rose-400/40">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Storefront / Creator Info */}
          {product.storefront && (
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white dark:text-slate-950 shrink-0 shadow-2xs">
                {product.storefront.displayName?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium truncate">{product.storefront.displayName}</span>
              {product.storefront.owner?.verificationTier === 'BUSINESS_VERIFIED' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug group-hover:text-orange-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Price</div>
            <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              <span className="text-orange-600 dark:text-cyan-400 text-xs font-bold">Rs</span>
              <span>{Number(product.basePrice).toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNavigate()
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 border border-slate-200 dark:bg-white/5 dark:hover:bg-cyan-500 dark:hover:text-slate-950 dark:text-slate-200 dark:border-white/10 dark:hover:border-cyan-400 transition-all duration-200 shadow-2xs group/btn cursor-pointer"
          >
            <span>View Store</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
