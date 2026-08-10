import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { scryptSync, randomBytes } from 'crypto';

const { PrismaClient } = pkg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Add it to your environment (e.g. .env) before running db:seed.'
  );
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Every id in the schema is a uuid v4 (`@default(uuid(4))`). Seed rows need *stable* ids so the
 * upserts below stay idempotent across runs, so the uuids are hardcoded here rather than generated
 * with `randomUUID()`.
 */
const ID = {
  users: {
    greatstack: 'bccc5657-c249-4fea-97b6-7389389c8b27',
    greatStack: 'c2747c97-152c-49fe-9ba8-a2a72485c7b2',
    kristin: '0f681416-7629-40d1-90c9-41bf08798613',
    jenny: 'd3a68a06-676f-4c05-a65d-27ec7d07162b',
    bessie: 'f2e8ece9-c048-4d74-a888-dd7ed94dd1c6',
    pulkit: 'c1c542f1-eb45-4d31-9689-99caa3617a27',
    ravi: '296b4dc6-1dfb-4355-bcb1-c5574304056a',
  },
  addresses: {
    primary: '1fef2329-e3a3-4c20-a9be-4f0a47ce42ee',
    secondary: '199b070a-6cc0-4ce6-b581-f5ed46240e78',
  },
  products: {
    lamp: 'f11b2f8f-c762-49af-98de-9d7ed27ad61f',
    speaker: 'b6f24ae5-efbd-4d81-b34d-4ab253922ce9',
    watchWhite: '72411b7b-f5aa-4eb1-a3fc-e1ec533870f7',
    headphones: '641ad5a9-dc32-499c-99be-19124bf6258d',
    watchBlack: 'bca70161-fbce-4c34-8471-a3efeaf1dc1a',
    camera: 'f755b828-8125-41cd-aef0-cb8380adcc69',
    pen: '9edc0f57-c34d-4746-9179-c632cfa0005c',
    theater: 'c8265d83-f396-4129-b54f-48a2646f6d95',
    earbuds: '84b29a54-c72b-4d65-84b5-c248b60ab46a',
    appleWatch: 'c9425638-4230-493a-8153-2401fd6a6eba',
    mouse: '28e5a808-b90a-465c-86df-15c3afe017f0',
    cleaner: 'dd02edfd-48f9-458a-80e0-322980835900',
    almond: '546038e1-c243-446f-ba6c-40b4d0de8f11',
    kaju: 'ddef9f00-7ebb-4627-a159-fc57c7660295',
    alsi: '6019a122-04a2-4cb9-8606-21ef5e200837',
    dates: '5f0035b2-b733-49bf-835f-0cea907528a2',
    kishmish: '90c844bf-aa0f-40db-b0bf-b41b6c1a0a06',
    makhana: '5a9a1b28-aa93-4998-bf83-ead26ae2c6cc',
    pista: 'ba4416cc-0699-4a5c-a050-9038af135efa',
    walnut: 'fd2c9ab5-b364-4931-b155-8c7c58104cce',
  },
  orders: {
    first: '4397eca9-d3eb-4e7e-b85b-e666ff440c48',
    second: '69414cd2-a34e-4c4e-8c5d-82a8f8f3ffeb',
  },
  ratings: [
    'e69a06fa-9cc5-4e71-8c4a-823e8ecd0ef3',
    'd246757a-4644-4129-81e9-7ed6319140ad',
    '98aa0880-09d8-46b3-82d1-978f13889cba',
    '29496334-f0fc-4a07-91df-50a7a050ed92',
    '34d2ae8b-80af-44a5-b110-f46877f1db1e',
    'd5289268-bed2-4dd2-94c4-4e77a5707bed',
    '8b324adc-b468-4edb-9577-d378ee0717cb',
    '2cd45d06-73a0-4863-97ee-6392f7d39370',
  ],
  // One order per rating (Rating requires an orderId).
  ratingOrders: [
    '5ef95795-a637-4267-95b8-1d6359c5ce5f',
    '0d87fef6-fb1c-47ac-b160-94daee597b3a',
    '1dc88199-92df-40ee-893a-c751cf606b5f',
    'f2923dab-0477-4dcb-b292-f5e74ba5d613',
    '4cde6c7e-103b-4b20-9a68-b594b04cd7f9',
    'a7304ac9-b50d-4583-a61e-36e472627f1b',
    'd7106ab6-ae89-4670-acdc-fac84a5ff9fe',
    '84b14866-8716-47b8-a8e7-6d83fdf24f62',
  ],
  otpTemplates: {
    login: 'c7f69a35-2646-4697-a0f0-fb8398d1ee5e',
    signup: '84e8047d-e656-4be2-ae6b-9e04eb33c701',
    reset: 'af1790cb-520d-4fbb-970a-79bce959bfa7',
  },
};

// Every seeded account shares the same password so the login flows are easy to exercise locally.
const SEED_PASSWORD = 'asphalt8';

const s3Host = 'http://localhost:4566';
const s3Bucket = 'mangal-superfoods-bucket';

function toS3Url(key) {
  if (!key || typeof key !== 'string') return '';
  if (/^https?:\/\//i.test(key)) return key;
  return `${s3Host}/${s3Bucket}/${key}`;
}

function toS3Images(images) {
  if (!Array.isArray(images)) return [];
  return images.map((image) => toS3Url(image));
}

function toImageStrings(images, fallbackPrefix) {
  // `assets/assets.js` imports images as modules; in DB we store strings.
  if (!Array.isArray(images)) return [];
  return images.map((_, idx) => `${fallbackPrefix}_${idx + 1}`);
}

function hashPassword(password) {
  // Hash password using same method as auth.js: salt:key format
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

async function main() {
  /**
   * Seed data derived from `assets/assets.js`.
   * We only persist DB-relevant structures (User/Product/Coupon/Address/Order/OrderItem/Rating).
   * UI-only objects like `dummyStoreData`, `storesDummyData`, dashboard aggregates are omitted.
   */

  // Users referenced by mocks — all emails use the @yopmail.com throwaway domain.
  const users = [
    {
      id: ID.users.greatstack,
      name: 'GreatStack',
      email: 'greatstack@yopmail.com',
      image: toS3Url('gs_logo.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '1234567890',
      firstName: 'Great',
      lastName: 'Stack',
      inactive: false,
      verifiedEmail: true,
      password: SEED_PASSWORD,
    },
    {
      id: ID.users.greatStack,
      name: 'Great Stack',
      email: 'great.stack@yopmail.com',
      image: toS3Url('gs_logo.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '0987654321',
      firstName: 'Great',
      lastName: 'Stack',
      inactive: false,
      verifiedEmail: true,
      password: SEED_PASSWORD,
    },
    {
      id: ID.users.kristin,
      name: 'Kristin Watson',
      email: 'kristin.watson@yopmail.com',
      image: toS3Url('profile_pic1.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '1111111111',
      firstName: 'Kristin',
      lastName: 'Watson',
      inactive: false,
      verifiedEmail: true,
      password: SEED_PASSWORD,
    },
    {
      id: ID.users.jenny,
      name: 'Jenny Wilson',
      email: 'jenny.wilson@yopmail.com',
      image: toS3Url('profile_pic2.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '2222222222',
      firstName: 'Jenny',
      lastName: 'Wilson',
      inactive: false,
      verifiedEmail: true,
      password: SEED_PASSWORD,
    },
    {
      id: ID.users.bessie,
      name: 'Bessie Cooper',
      email: 'bessie.cooper@yopmail.com',
      image: toS3Url('profile_pic3.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '3333333333',
      firstName: 'Bessie',
      lastName: 'Cooper',
      inactive: false,
      verifiedEmail: true,
      password: SEED_PASSWORD,
    },
    {
      id: ID.users.pulkit,
      name: 'Pulkit',
      email: 'pulkit19@yopmail.com',
      image: toS3Url('profile_pic1.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '9000000019',
      firstName: 'Pulkit',
      lastName: '',
      inactive: false,
      verifiedEmail: true,
      password: SEED_PASSWORD,
    },
    {
      id: ID.users.ravi,
      name: 'Ravi',
      email: 'ravi19@yopmail.com',
      image: toS3Url('profile_pic2.jpg'),
      cart: {},
      role: 'ADMIN',
      mobile: '9000000029',
      firstName: 'Ravi',
      lastName: '',
      inactive: false,
      verifiedEmail: true,
      password: SEED_PASSWORD,
    },
  ];

  // Addresses used by mocks (plus an extra ID referenced by order mocks)
  const addresses = [
    {
      id: ID.addresses.primary,
      userId: ID.users.greatstack,
      name: 'John Doe',
      mobile: '1234567890',
      pincode: '10001',
      addressLine1: '123 Main St, Apt 4B',
      addressLine2: 'Near Central Park',
      landmark: 'Opposite Starbucks',
      city: 'New York',
      state: 'New York',
    },
    {
      id: ID.addresses.secondary,
      userId: ID.users.greatstack,
      name: 'John Doe',
      mobile: '1234567890',
      pincode: '10001',
      addressLine1: '123 Main St, Apt 4B',
      addressLine2: 'Near Central Park',
      landmark: 'Opposite Starbucks',
      city: 'New York',
      state: 'New York',
    },
  ];

  // Coupons from `couponDummyData`
  const coupons = [
    {
      code: 'NEW20',
      description: '20% Off for New Users',
      discount: 20,
      forNewUser: true,
      forMember: false,
      isPublic: false,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    },
    {
      code: 'NEW10',
      description: '10% Off for New Users',
      discount: 10,
      forNewUser: true,
      forMember: false,
      isPublic: false,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    },
    {
      code: 'OFF20',
      description: '20% Off for All Users',
      discount: 20,
      forNewUser: false,
      forMember: false,
      isPublic: false,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    },
    {
      code: 'OFF10',
      description: '10% Off for All Users',
      discount: 10,
      forNewUser: false,
      forMember: false,
      isPublic: false,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    },
    {
      code: 'PLUS10',
      description: '20% Off for Members',
      discount: 10,
      forNewUser: false,
      forMember: true,
      isPublic: false,
      expiresAt: new Date('2027-03-06T00:00:00.000Z'),
    },
  ];

  // Products (union of `productDummyData` + `allitemsDummyData`)
  const products = [
    // `productDummyData` (electronics-ish)
    {
      id: ID.products.lamp,
      name: 'Modern table lamp',
      description:
        "Modern table lamp with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty. Enhance your audio experience with this earbuds. Indulge yourself in a world of pure sound with 50 hours of uninterrupted playtime. Equipped with the cutting-edge Zen Mode Tech ENC and BoomX Tech, prepare to be enthralled by a symphony of crystal-clear melodies.",
      mrp: 40,
      price: 29,
      images: ['techitems/product_img1.png', 'techitems/product_img2.png', 'techitems/product_img3.png', 'techitems/product_img4.png'],
      category: 'Decoration',
      inStock: true,
    },
    {
      id: ID.products.speaker,
      name: 'Smart speaker gray',
      description:
        "Smart speaker with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 50,
      price: 29,
      images: ['techitems/product_img2.png'],
      category: 'Speakers',
      inStock: true,
    },
    {
      id: ID.products.watchWhite,
      name: 'Smart watch white',
      description:
        "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 60,
      price: 29,
      images: ['techitems/product_img3.png'],
      category: 'Watch',
      inStock: true,
    },
    {
      id: ID.products.headphones,
      name: 'Wireless headphones',
      description:
        "Wireless headphones with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 70,
      price: 29,
      images: ['techitems/product_img4.png'],
      category: 'Headphones',
      inStock: true,
    },
    {
      id: ID.products.watchBlack,
      name: 'Smart watch black',
      description:
        "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 49,
      price: 29,
      images: ['techitems/product_img5.png'],
      category: 'Watch',
      inStock: true,
    },
    {
      id: ID.products.camera,
      name: 'Security Camera',
      description:
        "Security Camera with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 59,
      price: 29,
      images: ['techitems/product_img6.png'],
      category: 'Camera',
      inStock: true,
    },
    {
      id: ID.products.pen,
      name: 'Smart Pen for iPad',
      description:
        "Smart Pen for iPad with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 89,
      price: 29,
      images: ['techitems/product_img7.png'],
      category: 'Pen',
      inStock: true,
    },
    {
      id: ID.products.theater,
      name: 'Home Theater',
      description:
        "Home Theater with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 99,
      price: 29,
      images: ['techitems/product_img8.png'],
      category: 'Theater',
      inStock: true,
    },
    {
      id: ID.products.earbuds,
      name: 'Apple Wireless Earbuds',
      description:
        "Apple Wireless Earbuds with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 89,
      price: 29,
      images: ['techitems/product_img9.png'],
      category: 'Earbuds',
      inStock: true,
    },
    {
      id: ID.products.appleWatch,
      name: 'Apple Smart Watch',
      description:
        "Apple Smart Watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 179,
      price: 29,
      images: ['techitems/product_img10.png'],
      category: 'Watch',
      inStock: true,
    },
    {
      id: ID.products.mouse,
      name: 'RGB Gaming Mouse',
      description:
        "RGB Gaming Mouse with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 39,
      price: 29,
      images: ['techitems/product_img11.png'],
      category: 'Mouse',
      inStock: true,
    },
    {
      id: ID.products.cleaner,
      name: 'Smart Home Cleaner',
      description:
        "Smart Home Cleaner with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
      mrp: 199,
      price: 29,
      images: ['techitems/product_img12.png'],
      category: 'Cleaner',
      inStock: true,
    },

    // `allitemsDummyData` (superfoods)
    {
      id: ID.products.almond,
      name: 'Almond',
      description:
        'Premium California almonds packed with rich nutrients and a naturally crunchy taste. These almonds are perfect for snacking, gifting, or adding to desserts. Loaded with Vitamin E, antioxidants, and healthy fats, they help boost energy and improve overall wellness. Freshly sourced and hygienically packed to retain their natural goodness.',
      mrp: 520,
      price: 449,
      images: ['superfoods/almond.jpg'],
      category: 'Dry Fruits',
      inStock: true,
    },
    {
      id: ID.products.kaju,
      name: 'Kaju (Cashews)',
      description:
        'Luxuriously creamy and smooth cashews that melt in your mouth. These premium-quality nuts are rich in healthy fats, minerals, and antioxidants that support heart health and energy levels. Perfect for snacking, cooking, and festive desserts. Carefully selected and processed to deliver unmatched freshness and flavor.',
      mrp: 680,
      price: 599,
      images: ['superfoods/kaju.jpeg'],
      category: 'Dry Fruits',
      inStock: true,
    },
    {
      id: ID.products.alsi,
      name: 'Alsi (Flax Seeds)',
      description:
        'High-quality flax seeds rich in Omega-3 fatty acids, dietary fiber, and plant-based protein. These tiny power-packed seeds support digestion, heart health, and overall wellness. Add them to smoothies, salads, oatmeal, or baking for a crunchy texture and nutrient boost. Freshly packed to preserve natural oils and wholesome benefits.',
      mrp: 180,
      price: 149,
      images: ['superfoods/alsi.jpg'],
      category: 'Seeds',
      inStock: true,
    },
    {
      id: ID.products.dates,
      name: 'Dates',
      description:
        'Soft, naturally sweet, and energy-packed dates sourced from premium farms. Each bite delivers natural sugars, fiber, and essential minerals like potassium and magnesium. Perfect as a pre-workout snack or a healthy alternative to sweets. Packed fresh to retain their rich caramel-like taste and chewy texture.',
      mrp: 420,
      price: 369,
      images: ['superfoods/dates.avif'],
      category: 'Dry Fruits',
      inStock: true,
    },
    {
      id: ID.products.kishmish,
      name: 'Kishmish (Raisins)',
      description:
        'Juicy, sweet, and sun-dried to perfection, these raisins deliver natural sweetness in every bite. Rich in iron, antioxidants, and natural sugars, they help improve digestion and boost energy. Great for snacking, baking, and garnishing Indian sweets. Packed with care to preserve softness and flavor.',
      mrp: 240,
      price: 199,
      images: ['superfoods/kishmish.webp'],
      category: 'Dry Fruits',
      inStock: true,
    },
    {
      id: ID.products.makhana,
      name: 'Makhana (Fox Nuts)',
      description:
        'Light, crunchy, and incredibly nutritious fox nuts harvested from premium sources. These gluten-free superfoods are rich in plant protein, magnesium, and antioxidants. A perfect guilt-free snack that supports weight management and digestive wellness. Roasts beautifully for a delicious, healthy treat anytime.',
      mrp: 350,
      price: 299,
      images: ['superfoods/makhana.jpeg'],
      category: 'Healthy Snacks',
      inStock: true,
    },
    {
      id: ID.products.pista,
      name: 'Pista (Pistachios)',
      description:
        'Premium roasted pistachios with a satisfying crunch and rich, earthy flavor. Packed with protein, healthy fats, and antioxidants, these nuts are great for mindful snacking. Their vibrant color and unique taste make them perfect for dessert toppings, gifting, or daily nutrition. Sealed fresh to preserve aroma and taste.',
      mrp: 750,
      price: 679,
      images: ['superfoods/pista.webp'],
      category: 'Dry Fruits',
      inStock: true,
    },
    {
      id: ID.products.walnut,
      name: 'Walnut',
      description:
        'Handpicked premium walnuts rich in Omega-3 fatty acids and antioxidants. These crunchy halves add wholesome nutrition to your breakfast bowls, salads, and baking. A powerful superfood that supports heart and brain health. Carefully cleaned and sealed to maintain natural flavor and purity.',
      mrp: 650,
      price: 579,
      images: ['superfoods/wallnut.jpeg'],
      category: 'Dry Fruits',
      inStock: true,
    },
  ];

  // Order mocks: we normalize productIds to the embedded product.id values.
  const orders = [
    {
      id: ID.orders.first,
      total: 214.2,
      status: 'DELIVERED',
      userId: ID.users.greatstack,
      addressId: ID.addresses.secondary,
      isPaid: false,
      paymentMethod: 'COD',
      isCouponUsed: true,
      coupon: { code: 'NEW20', discount: 20 },
      items: [
        { productId: ID.products.lamp, quantity: 1, price: 89 },
        { productId: ID.products.speaker, quantity: 1, price: 149 },
      ],
    },
    {
      id: ID.orders.second,
      total: 421.6,
      status: 'DELIVERED',
      userId: ID.users.greatstack,
      addressId: ID.addresses.secondary,
      isPaid: false,
      paymentMethod: 'COD',
      isCouponUsed: true,
      coupon: { code: 'NEW20', discount: 20 },
      items: [
        { productId: ID.products.watchWhite, quantity: 1, price: 229 },
        { productId: ID.products.headphones, quantity: 1, price: 99 },
        { productId: ID.products.watchBlack, quantity: 1, price: 199 },
      ],
    },
  ];

  // Ratings from `dummyRatingsData` (each requires an orderId, so we create one order per rating)
  const ratings = [
    {
      id: ID.ratings[0],
      orderId: ID.ratingOrders[0],
      rating: 4,
      review:
        "I was a bit skeptical at first, but this product turned out to be even better than I imagined. The quality feels premium, it's easy to use, and it delivers exactly what was promised. I've already recommended it to friends and will definitely purchase again in the future.",
      userId: ID.users.kristin,
      productId: ID.products.lamp,
    },
    {
      id: ID.ratings[1],
      orderId: ID.ratingOrders[1],
      rating: 5,
      review:
        'This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: ID.users.jenny,
      productId: ID.products.speaker,
    },
    {
      id: ID.ratings[2],
      orderId: ID.ratingOrders[2],
      rating: 4,
      review:
        'This product is amazing. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: ID.users.bessie,
      productId: ID.products.watchWhite,
    },
    {
      id: ID.ratings[3],
      orderId: ID.ratingOrders[3],
      rating: 5,
      review:
        'This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: ID.users.kristin,
      productId: ID.products.headphones,
    },
    {
      id: ID.ratings[4],
      orderId: ID.ratingOrders[4],
      rating: 4,
      review:
        "Overall, I'm very happy with this purchase. It works as described and feels durable. The only reason I didn't give it five stars is because of a small issue (such as setup taking a bit longer than expected, or packaging being slightly damaged). Still, highly recommend it for anyone looking for a reliable option.",
      userId: ID.users.jenny,
      productId: ID.products.watchBlack,
    },
    {
      id: ID.ratings[5],
      orderId: ID.ratingOrders[5],
      rating: 5,
      review:
        'This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: ID.users.bessie,
      productId: ID.products.camera,
    },
    {
      id: ID.ratings[6],
      orderId: ID.ratingOrders[6],
      rating: 5,
      review: 'Fresh and crunchy almonds!',
      userId: ID.users.kristin,
      productId: ID.products.almond,
    },
    {
      id: ID.ratings[7],
      orderId: ID.ratingOrders[7],
      rating: 5,
      review: 'Best cashews online.',
      userId: ID.users.jenny,
      productId: ID.products.kaju,
    },
  ];

  // OTP Templates from WhatsApp/SMS provider
  const otpTemplates = [
    {
      id: ID.otpTemplates.login,
      key: 'LOGIN_OTP',
      body: 'Your login OTP is {{otp}}. It will expire in 5 minutes. Do not share this OTP with anyone.',
    },
    {
      id: ID.otpTemplates.signup,
      key: 'SIGNUP_OTP',
      body: 'Your verification OTP is {{otp}}. Use this to complete your Store signup. It will expire in 5 minutes.',
    },
    {
      id: ID.otpTemplates.reset,
      key: 'PASSWORD_RESET_OTP',
      body: 'Your password reset OTP is {{otp}}. It will expire in 5 minutes. If you did not request this, please ignore.',
    },
  ];

  // --- Upserts ---
  for (const u of users) {
    const hashedPassword = u.password ? hashPassword(u.password) : null;
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        email: u.email,
        image: u.image,
        cart: u.cart,
        mobile: u.mobile,
        password: hashedPassword,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        verifiedEmail: u.verifiedEmail,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        cart: u.cart,
        mobile: u.mobile,
        password: hashedPassword,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        verifiedEmail: u.verifiedEmail,
      },
    });
  }

  for (const a of addresses) {
    await prisma.address.upsert({
      where: { id: a.id },
      update: {
        userId: a.userId,
        name: a.name,
        mobile: a.mobile,
        pincode: a.pincode,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        landmark: a.landmark,
        city: a.city,
        state: a.state,
      },
      create: a,
    });
  }

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        description: c.description,
        discount: c.discount,
        forNewUser: c.forNewUser,
        forMember: c.forMember,
        isPublic: c.isPublic,
        expiresAt: c.expiresAt,
      },
      create: c,
    });
  }

  for (const p of products) {
    const images = toS3Images(p.images ?? toImageStrings([], `product/${p.id}`));
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        mrp: p.mrp,
        price: p.price,
        images,
        category: p.category,
        inStock: p.inStock ?? true,
      },
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        mrp: p.mrp,
        price: p.price,
        images,
        category: p.category,
        inStock: p.inStock ?? true,
      },
    });
  }

  for (const o of orders) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {
        total: o.total,
        status: o.status,
        userId: o.userId,
        addressId: o.addressId,
        isPaid: o.isPaid,
        paymentMethod: o.paymentMethod,
        isCouponUsed: o.isCouponUsed,
        coupon: o.coupon ?? {},
        orderItems: {
          deleteMany: {},
          create: o.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      create: {
        id: o.id,
        total: o.total,
        status: o.status,
        userId: o.userId,
        addressId: o.addressId,
        isPaid: o.isPaid,
        paymentMethod: o.paymentMethod,
        isCouponUsed: o.isCouponUsed,
        coupon: o.coupon ?? {},
        orderItems: {
          create: o.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    });
  }

  for (const template of otpTemplates) {
    await prisma.otpTemplate.upsert({
      where: { id: template.id },
      update: {
        key: template.key,
        body: template.body,
      },
      create: template,
    });
  }

  // Create ratings with their associated (delivered) orders
  for (const r of ratings) {
    await prisma.order.upsert({
      where: { id: r.orderId },
      update: {},
      create: {
        id: r.orderId,
        total: 100,
        status: 'DELIVERED',
        userId: r.userId,
        addressId: ID.addresses.primary,
        isPaid: true,
        paymentMethod: 'COD',
        isCouponUsed: false,
        coupon: {},
        orderItems: {
          create: [
            {
              productId: r.productId,
              quantity: 1,
              price: 100,
            },
          ],
        },
      },
    });

    await prisma.rating.upsert({
      where: {
        userId_productId_orderId: {
          userId: r.userId,
          productId: r.productId,
          orderId: r.orderId,
        },
      },
      update: {
        rating: r.rating,
        review: r.review,
      },
      create: {
        id: r.id,
        rating: r.rating,
        review: r.review,
        userId: r.userId,
        productId: r.productId,
        orderId: r.orderId,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete (mock data upserted).');
}

main()
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
