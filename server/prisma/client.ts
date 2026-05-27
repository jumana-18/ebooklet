import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Ensure the dbUrl is valid to prevent PrismaClient initialization error.
const hasValidDbUrl = config.dbUrl && (config.dbUrl.startsWith('postgresql://') || config.dbUrl.startsWith('postgres://'));
const safeDbUrl = hasValidDbUrl ? config.dbUrl : 'postgresql://dummy:dummy@localhost:5432/dummy';

export const realPrisma = new PrismaClient({
  datasources: {
    db: {
      url: safeDbUrl,
    },
  },
  log: config.env === 'development' ? ['error'] : ['error'],
});

// We will track connection state. Default to false, and let testPrismaConnection verify.
export let useFallback = false;

// Path to persistent fallback JSON store
const fallbackPath = path.join(process.cwd(), 'uploads', 'fallback_db.json');

// Memory storage database
let memoryDb: any = {
  categories: [],
  products: [],
  users: [],
  addresses: [],
  orders: [],
  orderItems: [],
  reviews: [],
  carts: [],
  cartItems: [],
  wishlists: [],
  wishlistItems: [],
  activities: [],
};

// Auto-save memory mutations to disk
function saveFallback() {
  try {
    const parentDir = path.dirname(fallbackPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(fallbackPath, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('⚠️ [Prisma Fallback] Save failure:', err);
  }
}

// Seed the initial fallback schema
function seedFallbackDb() {
  console.log('🌱 [Prisma Fallback] Seeding default records into offline fallback schema...');

  const categoriesData = [
    { id: 'cat-1', name: 'Fantasy', slug: 'fantasy', description: 'Explore magical kingdoms, ancient spells, and mythical legends.' },
    { id: 'cat-2', name: 'Romance', slug: 'romance', description: 'Immerse in timeless tales of affection, bonding, and emotional deepness.' },
    { id: 'cat-3', name: 'Mystery', slug: 'mystery', description: 'Unravel riddles, secret details, and clever plotting.' },
    { id: 'cat-4', name: 'Sci-Fi', slug: 'sci-fi', description: 'Venture into cosmos protocols, advanced mechanics, and space drift.' },
    { id: 'cat-5', name: 'Horror', slug: 'horror', description: 'Delve into eerie hauntings, shadows, and occult occurrences.' },
    { id: 'cat-6', name: 'Manga', slug: 'manga', description: 'Enjoy hand-crafted graphic novels and spirit warriors stories.' },
    { id: 'cat-7', name: 'Self Help', slug: 'self-help', description: 'Nurture wisdom, daily streaks, habits, and mindfulness.' },
    { id: 'cat-8', name: 'Poetry', slug: 'poetry', description: 'Savor elegant stanzas, rhymes, and rhythmic strophes.' },
    { id: 'cat-9', name: 'Classics', slug: 'classics', description: 'Sip vintage scripts, original philosophies, and historic arts.' },
    { id: 'cat-10', name: 'Young Adult', slug: 'young-adult', description: 'Connect with teenage explorations, growth curves, and school memories.' },
  ];

  const productsData = [
    {
      id: '1',
      title: 'The Enchanted Forest',
      author: 'Elara Moonwhisper',
      price: 14.99,
      rating: 4.8,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      categorySlug: 'fantasy',
      categoryId: 'cat-1',
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
      categoryId: 'cat-1',
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
      categoryId: 'cat-1',
      synopsis: 'Forgotten ruins, royal lineage mysteries, and an adventure to reclaim an emerald valley.',
      bookType: 'ebook',
    },
    {
      id: '4',
      title: 'A Thousand Promises',
      author: 'Clara Voss',
      price: 11.99,
      rating: 4.6,
      coverImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=600',
      categorySlug: 'romance',
      categoryId: 'cat-2',
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
      categoryId: 'cat-2',
      synopsis: 'Sipping lavender teas, local gossips, and budding connections in a vintage town.',
      bookType: 'ebook',
    },
    {
      id: '6',
      title: 'The Silent Grove',
      author: 'R. K. Sterling',
      price: 15.99,
      rating: 4.8,
      coverImage: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&q=80&w=600',
      categorySlug: 'mystery',
      categoryId: 'cat-3',
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
      categoryId: 'cat-3',
      synopsis: 'Lighthouse investigations, thick ocean mist, and missing diaries written in cipher code.',
      bookType: 'ebook',
    },
    {
      id: '8',
      title: 'Nebula Protocol',
      author: 'Jax Vansen',
      price: 25.99,
      rating: 4.9,
      coverImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600',
      categorySlug: 'sci-fi',
      categoryId: 'cat-4',
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
      categoryId: 'cat-4',
      synopsis: 'Navigating solar storms, resource shortages, and diplomatic relations with ring planets.',
      bookType: 'ebook',
    },
  ];

  memoryDb.categories = categoriesData;
  memoryDb.products = productsData;

  const passwordHash = bcrypt.hashSync('password', 10);
  const elaraEmail = 'elara@woodland.com';

  const elaraUser = {
    id: 'elara-uuid-123456',
    name: 'Elara Moonwhisper',
    email: elaraEmail,
    passwordHash: passwordHash,
    phone: '+1 (555) 732-4467',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    joinedDate: new Date().toISOString(),
    membership: 'Gold Member',
    streak: 18,
    poeticPoints: 340,
    favoriteGenres: ['Fantasy', 'Ancient History', 'Nature & Poetry'],
    readingGoalMinutes: 45,
    role: 'buyer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryDb.users = [elaraUser];

  memoryDb.addresses = [
    {
      id: 'addr-1',
      userId: elaraUser.id,
      label: 'Home Address',
      recipientName: 'Elara Moonwhisper',
      street: '14 Woodland Lane',
      city: 'Greenwood',
      province: 'Fantasy Valley',
      zipCode: '90210-99',
      phone: '+1 (555) 732-4467',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'addr-2',
      userId: elaraUser.id,
      label: 'Office Address',
      recipientName: 'Elara Moonwhisper',
      street: '7 Emerald Row',
      city: 'Oakville',
      province: 'Meadow Peak',
      zipCode: '85200-11',
      phone: '+1 (555) 211-9877',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  memoryDb.orders = [];
  memoryDb.reviews = [];
  memoryDb.carts = [{ id: 'cart-elara', userId: elaraUser.id }];
  memoryDb.wishlists = [{ id: 'wish-elara', userId: elaraUser.id }];
  memoryDb.cartItems = [];
  memoryDb.wishlistItems = [];
  memoryDb.orderItems = [];
  memoryDb.activities = [];

  saveFallback();
}

// Load Fallback on demand
function loadFallback() {
  try {
    const parentDir = path.dirname(fallbackPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    if (fs.existsSync(fallbackPath)) {
      const data = fs.readFileSync(fallbackPath, 'utf-8');
      memoryDb = JSON.parse(data);
      if (!memoryDb.orderItems) {
        memoryDb.orderItems = [];
      }
    } else {
      seedFallbackDb();
    }
  } catch (err) {
    console.error('⚠️ [Prisma Fallback] Failed to read fallback_db.json file:', err);
  }
}

// Map real Prisma relational queries to mock structures
function hydrateRelations(collection: string, doc: any, include: any): any {
  if (!doc) return doc;
  
  const hydrated = { ...doc };
  
  if (!include) return hydrated;

  if (collection === 'carts' && include.items) {
    const cartItems = (memoryDb.cartItems || []).filter((ci: any) => ci.cartId === hydrated.id);
    hydrated.items = cartItems.map((ci: any) => {
      const ciHydrated = { ...ci };
      if (include.items.include && include.items.include.product) {
        ciHydrated.product = (memoryDb.products || []).find((p: any) => p.id === ci.productId) || null;
      }
      return ciHydrated;
    });
  }

  if (collection === 'wishlists' && include.items) {
    const wishlistItems = (memoryDb.wishlistItems || []).filter((wi: any) => wi.wishlistId === hydrated.id);
    hydrated.items = wishlistItems.map((wi: any) => {
      const wiHydrated = { ...wi };
      if (include.items.include && include.items.include.product) {
        wiHydrated.product = (memoryDb.products || []).find((p: any) => p.id === wi.productId) || null;
      }
      return wiHydrated;
    });
  }

  if (collection === 'orders' && include.items) {
    const orderItems = (memoryDb.orderItems || []).filter((oi: any) => oi.orderId === hydrated.id);
    hydrated.items = orderItems.map((oi: any) => {
      const oiHydrated = { ...oi };
      if (include.items.include && include.items.include.product) {
        oiHydrated.product = (memoryDb.products || []).find((p: any) => p.id === oi.productId) || null;
      }
      return oiHydrated;
    });
  }

  if (collection === 'users') {
    if (include.addresses) {
      hydrated.addresses = (memoryDb.addresses || []).filter((addr: any) => addr.userId === hydrated.id);
    }
    if (include.orders) {
      hydrated.orders = (memoryDb.orders || []).filter((ord: any) => ord.userId === hydrated.id).map((ord: any) => hydrateRelations('orders', ord, include.orders.include));
    }
    if (include.cart) {
      const userCart = (memoryDb.carts || []).find((c: any) => c.userId === hydrated.id);
      hydrated.cart = userCart ? hydrateRelations('carts', userCart, include.cart.include) : null;
    }
    if (include.wishlist) {
      const userWish = (memoryDb.wishlists || []).find((w: any) => w.userId === hydrated.id);
      hydrated.wishlist = userWish ? hydrateRelations('wishlists', userWish, include.wishlist.include) : null;
    }
  }

  return hydrated;
}

// Generic collection filter processor to fully simulate Prisma query interfaces
function mockModel(collection: string) {
  return {
    async findMany(args: any = {}) {
      loadFallback();
      let items = [...(memoryDb[collection] || [])];

      // Deep query matching logic
      if (args.where) {
        items = items.filter(item => {
          for (const key of Object.keys(args.where)) {
            const condition = args.where[key];
            if (condition && typeof condition === 'object') {
              if ('contains' in condition) {
                const searchStr = String(condition.contains).toLowerCase();
                const itemVal = String(item[key] || '').toLowerCase();
                if (!itemVal.includes(searchStr)) return false;
              } else if ('gte' in condition) {
                if (Number(item[key]) < Number(condition.gte)) return false;
              } else if ('lte' in condition) {
                if (Number(item[key]) > Number(condition.lte)) return false;
              } else if ('equals' in condition) {
                if (item[key] !== condition.equals) return false;
              }
            } else if (condition !== undefined) {
              if (key === 'OR') {
                const results = condition.map((subCond: any) => {
                  return Object.keys(subCond).every(k => {
                    const subVal = subCond[k];
                    if (subVal && typeof subVal === 'object' && 'contains' in subVal) {
                      return String(item[k] || '').toLowerCase().includes(String(subVal.contains).toLowerCase());
                    }
                    return item[k] === subVal;
                  });
                });
                if (!results.some((r: boolean) => r)) return false;
              } else {
                if (item[key] !== condition) return false;
              }
            }
          }
          return true;
        });
      }

      // Order query handling
      if (args.orderBy) {
        const key = Object.keys(args.orderBy)[0];
        const direction = args.orderBy[key];
        items.sort((a, b) => {
          let valA = a[key];
          let valB = b[key];
          if (typeof valA === 'string') {
            return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          } else {
            return direction === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
          }
        });
      }

      // Limit results
      if (args.take) {
        items = items.slice(0, args.take);
      }

      if (args.include) {
        return items.map(item => hydrateRelations(collection, item, args.include));
      }
      return items;
    },

    async findUnique(args: any) {
      loadFallback();
      const items = memoryDb[collection] || [];
      const where = args.where;
      const key = Object.keys(where)[0];
      const val = where[key];
      const match = items.find((item: any) => item[key] === val);
      if (match && args.include) {
        return hydrateRelations(collection, match, args.include);
      }
      return match || null;
    },

    async findFirst(args: any = {}) {
      const items = await this.findMany(args);
      return items[0] || null;
    },

    async create(args: any) {
      loadFallback();
      const parentId = args.data.id || `${collection.slice(0, 3)}-${Math.random().toString(36).substr(2, 9)}`;
      
      const resolvedData = { ...args.data };
      
      // Handle special nested creates: items: { create: [...] }
      if (collection === 'orders' && resolvedData.items && resolvedData.items.create) {
        const createItems = Array.isArray(resolvedData.items.create) 
          ? resolvedData.items.create 
          : [resolvedData.items.create];
          
        memoryDb.orderItems = memoryDb.orderItems || [];
        for (const itemData of createItems) {
          memoryDb.orderItems.push({
            id: `ori-${Math.random().toString(36).substr(2, 9)}`,
            orderId: parentId,
            productId: itemData.productId,
            price: Number(itemData.price),
            quantity: Number(itemData.quantity),
            format: itemData.format,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        delete resolvedData.items;
      }
      
      const newItem = {
        id: parentId,
        ...resolvedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Strip recursive creates
      if (newItem.cart && 'create' in newItem.cart) delete newItem.cart;
      if (newItem.wishlist && 'create' in newItem.wishlist) delete newItem.wishlist;

      memoryDb[collection] = memoryDb[collection] || [];
      memoryDb[collection].push(newItem);
      saveFallback();

      if (collection === 'users') {
        memoryDb.carts.push({ id: `cart-${newItem.id}`, userId: newItem.id });
        memoryDb.wishlists.push({ id: `wish-${newItem.id}`, userId: newItem.id });
        saveFallback();
      }

      return hydrateRelations(collection, newItem, args.include);
    },

    async update(args: any) {
      loadFallback();
      const where = args.where;
      const key = Object.keys(where)[0];
      const val = where[key];

      const idx = (memoryDb[collection] || []).findIndex((item: any) => item[key] === val);
      if (idx === -1) {
        throw new Error(`Record to update not found in collection: ${collection}`);
      }

      const item = memoryDb[collection][idx];
      const resolvedData = { ...args.data };
      for (const field of Object.keys(resolvedData)) {
        const val = resolvedData[field];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          if ('increment' in val && typeof val.increment === 'number') {
            const currentNum = typeof item[field] === 'number' ? item[field] : 0;
            resolvedData[field] = currentNum + val.increment;
          } else if ('decrement' in val && typeof val.decrement === 'number') {
            const currentNum = typeof item[field] === 'number' ? item[field] : 0;
            resolvedData[field] = currentNum - val.decrement;
          }
        }
      }

      const updated = {
        ...item,
        ...resolvedData,
        updatedAt: new Date().toISOString()
      };

      memoryDb[collection][idx] = updated;
      saveFallback();
      return hydrateRelations(collection, updated, args.include);
    },

    async upsert(args: any) {
      loadFallback();
      try {
        const existing = await this.findUnique({ where: args.where });
        if (existing) {
          return await this.update({
            where: args.where,
            data: args.update,
            include: args.include
          });
        }
      } catch (err) {
        // Disregard and fallback to create
      }
      return await this.create({
        data: args.create,
        include: args.include
      });
    },

    async delete(args: any) {
      loadFallback();
      const where = args.where;
      const key = Object.keys(where)[0];
      const val = where[key];

      const idx = (memoryDb[collection] || []).findIndex((item: any) => item[key] === val);
      if (idx === -1) {
        throw new Error(`Record to delete not found in collection: ${collection}`);
      }

      const deletedItem = memoryDb[collection][idx];
      memoryDb[collection].splice(idx, 1);
      saveFallback();
      return deletedItem;
    },

    async deleteMany(args: any = {}) {
      loadFallback();
      const prevLength = (memoryDb[collection] || []).length;
      if (args.where && Object.keys(args.where).length > 0) {
        const key = Object.keys(args.where)[0];
        const val = args.where[key];
        memoryDb[collection] = (memoryDb[collection] || []).filter((item: any) => item[key] !== val);
      } else {
        memoryDb[collection] = [];
      }
      saveFallback();
      const currentLength = (memoryDb[collection] || []).length;
      return { count: prevLength - currentLength };
    },

    async createMany(args: any) {
      loadFallback();
      const items = args.data.map((d: any) => ({
        id: `${collection.slice(0, 3)}-${Math.random().toString(36).substr(2, 9)}`,
        ...d,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      memoryDb[collection] = memoryDb[collection] || [];
      memoryDb[collection].push(...items);
      saveFallback();
      return { count: items.length };
    },

    async count(args: any = {}) {
      const items = await this.findMany(args);
      return items.length;
    }
  };
}

// Proxied fallback client representation
const fallbackPrisma: any = {
  category: mockModel('categories'),
  product: mockModel('products'),
  user: mockModel('users'),
  address: mockModel('addresses'),
  order: mockModel('orders'),
  review: mockModel('reviews'),
  cart: mockModel('carts'),
  cartItem: mockModel('cartItems'),
  wishlist: mockModel('wishlists'),
  wishlistItem: mockModel('wishlistItems'),
  userActivity: mockModel('activities'),
  
  async $queryRaw() {
    return [1];
  },

  async $executeRaw() {
    return 1;
  },

  async $transaction(cb: any) {
    if (typeof cb === 'function') {
      return await cb(fallbackPrisma);
    }
    return cb;
  }
};

// Create a unified Proxy client that chooses the right driver seamlessly
export const prisma = new Proxy(realPrisma, {
  get(target: any, prop: string | symbol) {
    if (useFallback) {
      return fallbackPrisma[prop] || undefined;
    }
    
    // Normal query delegates directly to PrismaClient
    const realVal = target[prop];
    if (typeof realVal === 'function') {
      return function (this: any, ...args: any[]) {
        return realVal.apply(this, args);
      };
    }
    return realVal;
  }
}) as any;

/**
 * Checks the database connection health asynchronously
 */
export async function testPrismaConnection(): Promise<boolean> {
  const customDbUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
  const isPostgresFormat = customDbUrl && (customDbUrl.startsWith('postgresql://') || customDbUrl.startsWith('postgres://'));

  if (!isPostgresFormat) {
    console.warn('⚠️ [Prisma] PRISMA_DATABASE_URL/DATABASE_URL is empty or invalid. Engaging offline fallback engine.');
    useFallback = true;
    loadFallback();
    return false;
  }

  try {
    // Attempt verification query using native timeout limiters to prevent blocking startup
    const pingPromise = realPrisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 2500));
    
    await Promise.race([pingPromise, timeoutPromise]);
    console.log('✅ [Prisma] Successfully connected to PostgreSQL! Standard queries active.');
    useFallback = false;
    return true;
  } catch (err: any) {
    console.warn(`⚠️ [Prisma] Connection failed (${err.message}). Activating local sandbox fallback store.`);
    useFallback = true;
    loadFallback();
    return false;
  }
}
