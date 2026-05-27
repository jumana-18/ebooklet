import bcrypt from 'bcrypt';
import { prisma } from './client';

export async function seedDatabase() {
  try {
    console.log('🌱 [Seeder] Checking database records status...');

    // 1. Seed Categories if empty
    let categories: any[] = [];
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log('🌱 [Seeder] Seeding book categories...');
      const categoriesData = [
        { name: 'Fantasy', slug: 'fantasy', description: 'Explore magical kingdoms, ancient spells, and mythical legends.' },
        { name: 'Romance', slug: 'romance', description: 'Immerse in timeless tales of affection, bonding, and emotional deepness.' },
        { name: 'Mystery', slug: 'mystery', description: 'Unravel riddles, secret details, and clever plotting.' },
        { name: 'Sci-Fi', slug: 'sci-fi', description: 'Venture into cosmos protocols, advanced mechanics, and space drift.' },
        { name: 'Horror', slug: 'horror', description: 'Delve into eerie hauntings, shadows, and occult occurrences.' },
        { name: 'Manga', slug: 'manga', description: 'Enjoy hand-crafted graphic novels and spirit warriors stories.' },
        { name: 'Self Help', slug: 'self-help', description: 'Nurture wisdom, daily streaks, habits, and mindfulness.' },
        { name: 'Poetry', slug: 'poetry', description: 'Savor elegant stanzas, rhymes, and rhythmic strophes.' },
        { name: 'Classics', slug: 'classics', description: 'Sip vintage scripts, original philosophies, and historic arts.' },
        { name: 'Young Adult', slug: 'young-adult', description: 'Connect with teenage explorations, growth curves, and school memories.' },
      ];

      for (const cat of categoriesData) {
        const createdCat = await prisma.category.create({
          data: cat,
        });
        categories.push(createdCat);
      }
      console.log(`✅ [Seeder] Seeded ${categories.length} categories.`);
    } else {
      categories = await prisma.category.findMany();
    }

    // Map Category Slugs to Category IDs
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id);
    });

    // 2. Seed Products if empty
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      console.log('🌱 [Seeder] Seeding book items catalog...');
      const productsData = [
        // Fantasy
        {
          id: '1',
          title: 'The Enchanted Forest',
          author: 'Elara Moonwhisper',
          price: 14.99,
          rating: 4.8,
          coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'fantasy',
          synopsis: 'A beautiful journey through magical, whispering woodlands hidden beyond the mortal stream.',
          bookType: 'ebook',
        },
        {
          id: '2',
          title: 'The Shadow Heir',
          author: 'L. J. Andrews',
          price: 12.49,
          rating: 4.7,
          coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'fantasy',
          synopsis: 'Dark crowns, magical inheritance, and hidden shadows conflicting for control over land.',
          bookType: 'physical',
        },
        {
          id: '3',
          title: 'The Lost Kingdom',
          author: 'M. R. Hawthorne',
          price: 15.99,
          rating: 4.9,
          coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'fantasy',
          synopsis: 'Forgotten ruins, royal lineage mysteries, and an adventure to reclaim an emerald valley.',
          bookType: 'ebook',
        },
        // Romance
        {
          id: '4',
          title: 'A Thousand Promises',
          author: 'Clara Voss',
          price: 11.99,
          rating: 4.6,
          coverImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'romance',
          synopsis: 'An emotional romance detailing covenants of gold made in secret gardens.',
          bookType: 'physical',
        },
        {
          id: '5',
          title: 'Wisteria Lane',
          author: 'Sophie Thorne',
          price: 14.99,
          rating: 4.5,
          coverImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'romance',
          synopsis: 'Sipping lavender teas, local gossips, and budding connections in a vintage town.',
          bookType: 'ebook',
        },
        // Mystery
        {
          id: '6',
          title: 'The Silent Grove',
          author: 'R. K. Sterling',
          price: 15.99,
          rating: 4.8,
          coverImage: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'mystery',
          synopsis: 'A quiet grove conceals secrets of high political plots and missing archeologists.',
          bookType: 'physical',
        },
        {
          id: '7',
          title: 'Whispers in the Mist',
          author: 'Thomas Hardie',
          price: 17.50,
          rating: 4.2,
          coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'mystery',
          synopsis: 'Lighthouse investigations, thick ocean mist, and missing diaries written in cipher code.',
          bookType: 'ebook',
        },
        // Sci-Fi
        {
          id: '8',
          title: 'Nebula Protocol',
          author: 'Jax Vansen',
          price: 25.99,
          rating: 4.9,
          coverImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'sci-fi',
          synopsis: 'Cybernetic conspiracies, star cruisers control codes, and deep space protocol sequences.',
          bookType: 'physical',
        },
        {
          id: '9',
          title: 'Solar Drift',
          author: 'Elena Kostic',
          price: 21.00,
          rating: 4.6,
          coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
          categorySlug: 'sci-fi',
          synopsis: 'Navigating solar storms, resource shortages, and diplomatic relations with ring planets.',
          bookType: 'ebook',
        },
      ];

      for (const prod of productsData) {
        const catId = categoryMap.get(prod.categorySlug) || categories[0]?.id;
        await prisma.product.create({
          data: {
            id: prod.id,
            title: prod.title,
            author: prod.author,
            price: prod.price,
            rating: prod.rating,
            coverImage: prod.coverImage,
            categoryId: catId,
            categorySlug: prod.categorySlug,
            synopsis: prod.synopsis,
            bookType: prod.bookType,
          },
        });
      }
      console.log(`✅ [Seeder] Seeded ${productsData.length} products.`);
    }

    // 3. Seed Elara Moonwhisper (Default Account) if not present
    const elaraEmail = 'elara@woodland.com';
    const elaraUser = await prisma.user.findUnique({
      where: { email: elaraEmail },
    });

    if (!elaraUser) {
      console.log('🌱 [Seeder] Seeding default profile "Elara Moonwhisper"...');
      const standardHash = await bcrypt.hash('password', 12);
      
      const elara = await prisma.user.create({
        data: {
          name: 'Elara Moonwhisper',
          email: elaraEmail,
          passwordHash: standardHash,
          phone: '+1 (555) 732-4467',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
          readingGoalMinutes: 45,
          favoriteGenres: ['Fantasy', 'Ancient History', 'Nature & Poetry'],
          joinedDate: new Date(),
          membership: 'Gold Member',
          streak: 18,
          poeticPoints: 340,
          role: 'buyer',
          cart: { create: {} },
          wishlist: { create: {} },
        },
      });

      // Seed Default Addresses for Elara
      await prisma.address.createMany({
        data: [
          {
            userId: elara.id,
            label: 'Home Address',
            recipientName: 'Elara Moonwhisper',
            street: '14 Woodland Lane',
            city: 'Greenwood',
            province: 'Fantasy Valley',
            zipCode: '90210-99',
            phone: '+1 (555) 732-4467',
            isDefault: true,
          },
          {
            userId: elara.id,
            label: 'Office Address',
            recipientName: 'Elara Moonwhisper',
            street: '7 Emerald Row',
            city: 'Oakville',
            province: 'Meadow Peak',
            zipCode: '85200-11',
            phone: '+1 (555) 211-9877',
            isDefault: false,
          },
        ],
      });

      console.log('✅ [Seeder] Seeded Elara Moonwhisper account, default shipping addresses.');
    }

    console.log('🌱 [Seeder] Seeding complete! Database is primed and ready.');
  } catch (err: any) {
    console.error('❌ [Seeder] Seeding failed:', err.message || err);
  }
}

// Run seeder if executed directly
if (process.argv[1] && (process.argv[1].endsWith('seeder.ts') || process.argv[1].endsWith('seeder.js') || process.argv[1].endsWith('seeder.cjs'))) {
  console.log('🏃 [Seeder] Running database seed directly...');
  seedDatabase()
    .then(() => {
      console.log('✅ [Seeder] Directly-invoked seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ [Seeder] Directly-invoked seeding failed:', err);
      process.exit(1);
    });
}

