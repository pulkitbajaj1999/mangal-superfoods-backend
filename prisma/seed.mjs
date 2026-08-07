import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

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

function toStableUserId(name) {
  return (
    'user_' +
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  );
}

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

async function main() {
  /**
   * Seed data derived from `assets/assets.js`.
   * We only persist DB-relevant structures (User/Product/Coupon/Address/Order/OrderItem/Rating).
   * UI-only objects like `dummyStoreData`, `storesDummyData`, dashboard aggregates are omitted.
   */

  // Users referenced by mocks
  const users = [
    {
      id: 'user_31dQbH27HVtovbs13X2cmqefddM',
      name: 'GreatStack',
      email: 'greatstack@example.com',
      image: toS3Url('gs_logo.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '1234567890',
      firstName: 'Great',
      lastName: 'Stack',
      inactive: false,
      verifiedEmail: true,
      password: 'password123',
    },
    {
      id: 'user_31dOriXqC4TATvc0brIhlYbwwc5',
      name: 'Great Stack',
      email: 'user.greatstack@gmail.com',
      image: toS3Url('gs_logo.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '0987654321',
      firstName: 'Great',
      lastName: 'Stack',
      inactive: false,
      verifiedEmail: true,
      password: 'password123',
    },
    {
      id: toStableUserId('Kristin Watson'),
      name: 'Kristin Watson',
      email: 'kristin.watson@example.com',
      image: toS3Url('profile_pic1.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '1111111111',
      firstName: 'Kristin',
      lastName: 'Watson',
      inactive: false,
      verifiedEmail: true,
      password: 'password123',
    },
    {
      id: toStableUserId('Jenny Wilson'),
      name: 'Jenny Wilson',
      email: 'jenny.wilson@example.com',
      image: toS3Url('profile_pic2.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '2222222222',
      firstName: 'Jenny',
      lastName: 'Wilson',
      inactive: false,
      verifiedEmail: true,
      password: 'password123',
    },
    {
      id: toStableUserId('Bessie Cooper'),
      name: 'Bessie Cooper',
      email: 'bessie.cooper@example.com',
      image: toS3Url('profile_pic3.jpg'),
      cart: {},
      role: 'CUSTOMER',
      mobile: '3333333333',
      firstName: 'Bessie',
      lastName: 'Cooper',
      inactive: false,
      verifiedEmail: true,
      password: 'password123',
    },
  ];

  // Addresses used by mocks (plus an extra ID referenced by order mocks)
  const addresses = [
    {
      id: 'addr_1',
      userId: 'user_31dQbH27HVtovbs13X2cmqefddM',
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
      id: 'cmemm6g95001ftat8omv9b883',
      userId: 'user_31dQbH27HVtovbs13X2cmqefddM',
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
      id: 'prod_1',
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
      id: 'prod_2',
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
      id: 'prod_3',
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
      id: 'prod_4',
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
      id: 'prod_5',
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
      id: 'prod_6',
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
      id: 'prod_7',
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
      id: 'prod_8',
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
      id: 'prod_9',
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
      id: 'prod_10',
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
      id: 'prod_11',
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
      id: 'prod_12',
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
      id: 'prod_almond',
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
      id: 'prod_kaju',
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
      id: 'prod_alsi',
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
      id: 'prod_dates',
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
      id: 'prod_kishmish',
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
      id: 'prod_makhana',
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
      id: 'prod_pista',
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
      id: 'prod_walnut',
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
      id: 'cmemm75h5001jtat89016h1p3',
      total: 214.2,
      status: 'DELIVERED',
      userId: 'user_31dQbH27HVtovbs13X2cmqefddM',
      addressId: 'cmemm6g95001ftat8omv9b883',
      isPaid: false,
      paymentMethod: 'COD',
      isCouponUsed: true,
      coupon: { code: 'NEW20', discount: 20 },
      items: [
        { productId: 'prod_1', quantity: 1, price: 89 },
        { productId: 'prod_2', quantity: 1, price: 149 },
      ],
    },
    {
      id: 'cmemm6jv7001htat8vmm3gxaf',
      total: 421.6,
      status: 'DELIVERED',
      userId: 'user_31dQbH27HVtovbs13X2cmqefddM',
      addressId: 'cmemm6g95001ftat8omv9b883',
      isPaid: false,
      paymentMethod: 'COD',
      isCouponUsed: true,
      coupon: { code: 'NEW20', discount: 20 },
      items: [
        { productId: 'prod_3', quantity: 1, price: 229 },
        { productId: 'prod_4', quantity: 1, price: 99 },
        { productId: 'prod_5', quantity: 1, price: 199 },
      ],
    },
  ];

  // Ratings from `dummyRatingsData` (require an orderId in schema, so we create per-rating orders)
  const ratings = [
    {
      id: 'rat_1',
      rating: 4,
      review:
        "I was a bit skeptical at first, but this product turned out to be even better than I imagined. The quality feels premium, it's easy to use, and it delivers exactly what was promised. I've already recommended it to friends and will definitely purchase again in the future.",
      userName: 'Kristin Watson',
      productId: 'prod_1',
    },
    {
      id: 'rat_2',
      rating: 5,
      review:
        'This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userName: 'Jenny Wilson',
      productId: 'prod_2',
    },
    {
      id: 'rat_3',
      rating: 4,
      review:
        'This product is amazing. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userName: 'Bessie Cooper',
      productId: 'prod_3',
    },
    {
      id: 'rat_4',
      rating: 5,
      review:
        'This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userName: 'Kristin Watson',
      productId: 'prod_4',
    },
    {
      id: 'rat_5',
      rating: 4,
      review:
        "Overall, I'm very happy with this purchase. It works as described and feels durable. The only reason I didn't give it five stars is because of a small issue (such as setup taking a bit longer than expected, or packaging being slightly damaged). Still, highly recommend it for anyone looking for a reliable option.",
      userName: 'Jenny Wilson',
      productId: 'prod_5',
    },
    {
      id: 'rat_6',
      rating: 5,
      review:
        'This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userName: 'Bessie Cooper',
      productId: 'prod_6',
    },
  ];

  // OTP Templates from WhatsApp/SMS provider
  const otpTemplates = [
    {
      id: 'otp_template_login',
      key: 'LOGIN_OTP',
      body: 'Your login OTP is {{otp}}. It will expire in 5 minutes. Do not share this OTP with anyone.',
    },
    {
      id: 'otp_template_signup',
      key: 'SIGNUP_OTP',
      body: 'Your verification OTP is {{otp}}. Use this to complete your Store signup. It will expire in 5 minutes.',
    },
    {
      id: 'otp_template_reset',
      key: 'PASSWORD_RESET_OTP',
      body: 'Your password reset OTP is {{otp}}. It will expire in 5 minutes. If you did not request this, please ignore.',
    },
  ];

  // --- Upserts ---
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, email: u.email, image: u.image, cart: u.cart },
      create: { id: u.id, name: u.name, email: u.email, image: u.image, cart: u.cart },
    });
  }

  for (const a of addresses) {
    await prisma.address.upsert({
      where: { id: a.id },
      update: {
        userId: a.userId,
        name: a.name,
        email: a.email,
        street: a.street,
        city: a.city,
        state: a.state,
        zip: a.zip,
        country: a.country,
        phone: a.phone,
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

