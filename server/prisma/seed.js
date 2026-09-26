const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  {
    name: 'Fashion & Accessories',
    slug: 'fashion-accessories',
    storefrontLabel: 'Store',
    icon: '👗',
    description: 'Clothing, jewelry, bags, shoes, and accessories',
    sortOrder: 1,
  },
  {
    name: 'Art, Design & Handmade',
    slug: 'art-design-handmade',
    storefrontLabel: 'Studio',
    icon: '🎨',
    description: 'Paintings, crafts, illustration, calligraphy, and handmade items',
    sortOrder: 2,
  },
  {
    name: 'Food & Beverage',
    slug: 'food-beverage',
    storefrontLabel: 'Kitchen',
    icon: '🍳',
    description: 'Home bakers, meal prep, catering, chai stalls, and homemade food',
    sortOrder: 3,
  },
  {
    name: 'Tutoring & Education',
    slug: 'tutoring-education',
    storefrontLabel: 'Academy',
    icon: '📚',
    description: 'Tutors, exam prep, skill classes, and language coaches',
    sortOrder: 4,
  },
  {
    name: 'Tech & Digital Services',
    slug: 'tech-digital-services',
    storefrontLabel: 'Workshop',
    icon: '💻',
    description: 'Web development, app development, repairs, and digital services',
    sortOrder: 5,
  },
  {
    name: 'Photography & Media',
    slug: 'photography-media',
    storefrontLabel: 'Studio',
    icon: '📸',
    description: 'Photographers, videographers, editors, and media production',
    sortOrder: 6,
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    storefrontLabel: 'Practice',
    icon: '🌿',
    description: 'Fitness coaching, nutrition, therapy, and skincare',
    sortOrder: 7,
  },
  {
    name: 'Events & Personal Services',
    slug: 'events-personal-services',
    storefrontLabel: 'Services',
    icon: '🎉',
    description: 'Event planners, decorators, gift curation, and personal services',
    sortOrder: 8,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    storefrontLabel: 'Shop',
    icon: '🏠',
    description: 'Furniture, decor, candles, plants, and home accessories',
    sortOrder: 9,
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    storefrontLabel: 'Corner',
    icon: '📖',
    description: 'Books, journals, custom stationery, and paper goods',
    sortOrder: 10,
  },
  {
    name: 'Automotive & Repair',
    slug: 'automotive-repair',
    storefrontLabel: 'Garage',
    icon: '🔧',
    description: 'Car accessories, repair services, and automotive detailing',
    sortOrder: 11,
  },
];

async function main() {
  console.log('🌱 Seeding categories...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    console.log(`  ✓ ${category.name} (${category.storefrontLabel})`);
  }

  console.log(`\n✅ Seeded ${categories.length} categories successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
