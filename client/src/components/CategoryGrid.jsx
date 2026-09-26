import { motion } from 'framer-motion'
import { Sparkles, Tag } from 'lucide-react'

export default function CategoryGrid({ categories = [], activeCategory, onSelectCategory }) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2.5 min-w-max pb-1">
        {/* "All" button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeCategory === 'all'
              ? 'text-white shadow-md shadow-orange-500/20 dark:shadow-cyan-500/20'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 shadow-2xs'
          }`}
        >
          {activeCategory === 'all' && (
            <motion.div
              layoutId="activeCategoryPill"
              className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 dark:from-cyan-500 dark:to-blue-600 rounded-xl"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </span>
        </button>

        {/* Category buttons */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'text-white shadow-md shadow-orange-500/20 dark:shadow-cyan-500/20'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 shadow-2xs'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 dark:from-cyan-500 dark:to-blue-600 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-orange-400" />
                <span>{cat.name}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
