import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Store, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Package, 
  Palette, 
  Award, 
  ChevronRight,
  Zap,
  HelpCircle,
  Truck
} from 'lucide-react'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'

const GUIDES = [
  {
    id: 1,
    slug: 'launch-independent-brand',
    title: 'How to launch an independent brand: A simple six-step guide',
    category: 'Foundations',
    readTime: '6 min read',
    lead: 'From kitchen table experiments to a standalone digital storefront. Everything you need to know about launching your brand with clear identity, compelling photography, and customer trust.',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        num: '01',
        title: 'Define your signature point of view',
        content: 'Independent brands win because they stand for something specific. Instead of trying to please everyone, focus on your signature style: minimalist stoneware pottery, raw handwoven linen, or small-batch organic botanical balms. Document what makes your craft distinct from mass-manufactured goods.'
      },
      {
        num: '02',
        title: 'Shoot natural, tactile photography',
        content: 'Shoppers cannot physically hold your products online, so your photography must do the sensory work. Use soft indirect window lighting. Show close-ups of glaze textures, stitching details, and real human hands for scale. Avoid digital cutouts or harsh flash.'
      },
      {
        num: '03',
        title: 'Claim your UniVerse flagship and custom @handle',
        content: 'Set up your unique web address (universe.pk/@yourbrand). Customize your storefront header banner with imagery of your studio or workshop, set your accent palette, and link your Instagram, WhatsApp, and website so clients have seamless multi-channel access.'
      },
      {
        num: '04',
        title: 'Write transparent product stories',
        content: 'List dimensions in centimeters/inches, exact material composition, batch dates, and care instructions. Explain your process: customers value knowing that a ceramic mug took four days to hand-throw, dry, and fire.'
      },
      {
        num: '05',
        title: 'Design an unboxing moment',
        content: 'Your packaging is your only physical brand touchpoint before the product is used. Even simple kraft paper, a handwritten thank-you note, and an organic twine tie creates a memorable unboxing that triggers repeat orders and social shares.'
      },
      {
        num: '06',
        title: 'Build direct customer relationships over chat',
        content: 'Take advantage of UniVerse built-in messaging. Respond promptly to inquiries about custom colors, bespoke sizing, or delivery timelines. A personal response turns casual browsers into lifelong patrons.'
      }
    ]
  },
  {
    id: 2,
    slug: 'pricing-for-profit',
    title: 'Pricing for profit: What wholesale and direct margins really mean',
    category: 'Financial Strategy',
    readTime: '8 min read',
    lead: 'Underpricing is the most common reason promising artisan businesses close. Learn how to accurately calculate your labor, account for hidden costs, and price your work with confidence.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        num: '01',
        title: 'The true artisan cost formula',
        content: 'Direct Materials + (Labor Hours × Your Hourly Wage) + Overhead Percentage = Base Cost. Most makers forget to pay themselves an hourly wage, treating their time as free. Always budget at least Rs 800-1500/hour for skilled craft labor.'
      },
      {
        num: '02',
        title: 'Direct-to-consumer vs wholesale margins',
        content: 'Wholesale typically requires a 50% discount off retail price. If your retail price does not support wholesale margins, you will be trapped in small batches forever. Formulate your retail price as Base Cost × 2 (Wholesale), and Wholesale × 2 (Retail).'
      },
      {
        num: '03',
        title: 'Accounting for shrinkage, testing, and packaging',
        content: 'Clay breaks in the kiln, fabric has misprints, and ingredients expire. Always include a 10-15% buffer in your raw material costs to account for waste, sampling, test batches, and eco-friendly packing boxes.'
      },
      {
        num: '04',
        title: 'UniVerse 0% commission advantage',
        content: 'While other platforms take 15-20% cut on every sale, UniVerse charges 0% commission for your first 24 months. Reinvest that 20% directly into higher quality raw materials, packaging, or marketing.'
      }
    ]
  },
  {
    id: 3,
    slug: 'curating-first-catalog',
    title: 'Curating your first catalog: Data-backed essentials for your launch',
    category: 'Merchandising',
    readTime: '5 min read',
    lead: 'How many items should you launch with? How should you structure your collection? Master the architecture of a balanced, high-converting product catalog.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        num: '01',
        title: 'The 6-to-12 SKU launch sweet spot',
        content: 'Too few listings (1-2) makes your store look empty and unverified. Too many (50+) overwhelms shoppers and spreads your production thin. Launching with 6 to 12 curated items is proven to maximize conversion and browsing time.'
      },
      {
        num: '02',
        title: 'The Hero, Core, and Accent framework',
        content: 'Every good catalog has 1-2 "Hero" showcase pieces that draw attention, 4-6 "Core" reliable bestsellers that generate volume, and 2-3 accessible "Accent" gift items priced under Rs 2,000 for low-friction trial purchases.'
      },
      {
        num: '03',
        title: 'Utilize owner-featured stars',
        content: 'In your UniVerse Dashboard, mark your strongest creations with the Star button. Our platform recommendation engine indexes featured items and rotates them fairly into our "Best of the Month" marketplace showcase.'
      },
      {
        num: '04',
        title: 'Seasonal drops vs evergreen staples',
        content: 'Keep 70% of your catalog evergreen (available year-round) and introduce 30% as limited seasonal drops. Limited batches create healthy urgency and give past customers a reason to return.'
      }
    ]
  },
  {
    id: 4,
    slug: 'scaling-sustainable-production',
    title: 'Scaling sustainable production: Guard your creative capacity and craft',
    category: 'Operations',
    readTime: '7 min read',
    lead: 'Growth is exciting, but unmanaged growth leads to burnt-out makers and degraded craft quality. Here is how to scale up production while preserving the soul of your work.',
    image: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        num: '01',
        title: 'Batch production workflows',
        content: 'Never make items one by one from start to finish. Group your tasks: dedicate Mondays to material prep and cutting, Tuesdays and Wednesdays to assembly, Thursdays to finishing and quality checks, and Fridays to packing and shipping.'
      },
      {
        num: '02',
        title: 'Use inventory buffers and vacation mode',
        content: 'Never let your stock count exceed what you can comfortably fulfill within your stated delivery window. If custom commissions or seasonal demand spikes, toggle UniVerse "Vacation Mode" to pause orders without losing your ranking.'
      },
      {
        num: '03',
        title: 'Local supplier partnerships',
        content: 'Build direct ties with local raw material suppliers, packaging fabricators, and domestic couriers. Negotiate bulk pricing on standard packaging and maintain a minimum 30-day buffer of core ingredients or materials.'
      },
      {
        num: '04',
        title: 'Preserve the joy of creating',
        content: 'Do not automate away the details that make your brand special. When scaling, delegate repetitive tasks like shipping label printing and bookkeeping, while keeping hands-on control over formulation, shaping, and quality.'
      }
    ]
  }
]

export default function FoundersHub() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedGuideId, setSelectedGuideId] = useState(1)

  useEffect(() => {
    // Check hash for guide selection (e.g. #guide-2)
    const hash = location.hash
    if (hash && hash.startsWith('#guide-')) {
      const id = parseInt(hash.replace('#guide-', ''), 10)
      if (id && GUIDES.some((g) => g.id === id)) {
        setSelectedGuideId(id)
        const el = document.getElementById('guide-detail-section')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location.hash])

  const activeGuide = GUIDES.find((g) => g.id === selectedGuideId) || GUIDES[0]

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 mb-14 border border-orange-200/90 dark:border-white/10 bg-gradient-to-br from-orange-50 via-amber-50/40 to-orange-100/50 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 shadow-sm">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-cyan-400 border border-orange-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UniVerse Creator &amp; Founder Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              The Playbook for Independent Brands
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Practical guides, pricing blueprints, catalog architecture, and sustainable operations for independent artisans, designers, and local brand founders.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to={user?.storefront ? `/store/${user.storefront.handle}` : (user ? '/setup-store' : '/register')}
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>{user?.storefront ? 'View Your Store' : 'Open Storefront Free'}</span>
              </Link>
              <a
                href="#all-guides"
                className="px-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors"
              >
                <span>Browse Guides</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 GUIDE CARDS SELECTION */}
        <section id="all-guides" className="mb-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-orange-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                Curated Masterclasses
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Core Brand Guides
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Click any guide to read the full step-by-step breakdown below
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GUIDES.map((guide) => {
              const isSelected = guide.id === selectedGuideId
              return (
                <div
                  key={guide.id}
                  onClick={() => {
                    setSelectedGuideId(guide.id)
                    const el = document.getElementById('guide-detail-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`group flex flex-col rounded-2xl overflow-hidden p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/80 dark:bg-slate-800/80 border-orange-500 dark:border-cyan-400 shadow-md ring-2 ring-orange-500/20'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
                  }`}
                >
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-xs">
                      {guide.category}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-slate-900 dark:text-white text-base font-semibold leading-snug group-hover:text-orange-600 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-2">
                        {guide.lead}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{guide.readTime}</span>
                      </span>
                      <span className={`font-bold inline-flex items-center gap-0.5 ${
                        isSelected ? 'text-orange-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        <span>{isSelected ? 'Reading' : 'Read Guide'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* DETAILED GUIDE READING VIEW */}
        <section id="guide-detail-section" className="scroll-mt-28">
          <div className="bg-white dark:bg-slate-900/70 rounded-3xl p-6 sm:p-12 border border-slate-200/90 dark:border-white/10 shadow-sm">
            {/* Guide Header */}
            <div className="max-w-3xl mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 dark:bg-cyan-500/20 text-orange-800 dark:text-cyan-300">
                  {activeGuide.category}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeGuide.readTime}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif text-slate-900 dark:text-white font-normal leading-tight mb-4">
                {activeGuide.title}
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {activeGuide.lead}
              </p>
            </div>

            {/* Guide Feature Image */}
            <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-12 border border-slate-200 dark:border-white/10">
              <img
                src={activeGuide.image}
                alt={activeGuide.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Step-by-Step Breakdown */}
            <div className="space-y-8 max-w-4xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/5">
                Actionable Blueprint
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {activeGuide.steps.map((step) => (
                  <div
                    key={step.num}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <span className="text-2xl font-black text-orange-600 dark:text-cyan-400 shrink-0 sm:w-12">
                      {step.num}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                        {step.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Card */}
            <div className="mt-14 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-orange-50/50 dark:bg-white/[0.02] p-6 rounded-2xl">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Put these principles into action today
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Launch your free storefront on UniVerse in less than two minutes.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to={user?.storefront ? `/store/${user.storefront.handle}` : (user ? '/setup-store' : '/register')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{user?.storefront ? 'Open Store Dashboard' : 'Start Your Storefront'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
