import gs_logo from "./gs_logo.jpg"
import happy_store from "./happy_store.webp"
import upload_area from "./upload_area.svg"
import hero_model_img from "./hero_model_img.png"
import hero_product_img1 from "./hero_product_img1.png"
import hero_product_img2 from "./hero_product_img2.png"
import product_img1 from "./product_img1.png"
import product_img2 from "./product_img2.png"
import product_img3 from "./product_img3.png"
import product_img4 from "./product_img4.png"
import product_img5 from "./product_img5.png"
import product_img6 from "./product_img6.png"
import product_img7 from "./product_img7.png"
import product_img8 from "./product_img8.png"
import product_img9 from "./product_img9.png"
import product_img10 from "./product_img10.png"
import product_img11 from "./product_img11.png"
import product_img12 from "./product_img12.png"
import { ClockFadingIcon, HeadsetIcon, SendIcon } from "lucide-react";
import profile_pic1 from "./profile_pic1.jpg"
import profile_pic2 from "./profile_pic2.jpg"
import profile_pic3 from "./profile_pic3.jpg"

// superfoods
import almond from "./superfoods/almond.jpg"
import kaju from "./superfoods/kaju.jpeg"
import alsi from "./superfoods/alsi.jpg"
import dates from "./superfoods/dates.avif"
import kishmish from "./superfoods/kishmish.webp"
import makhana from "./superfoods/makhana.jpeg"
import pista from "./superfoods/pista.webp"
import wallnut from "./superfoods/wallnut.jpeg"

export const assets = {
    upload_area, hero_model_img,
    hero_product_img1, hero_product_img2, gs_logo,
    product_img1, product_img2, product_img3, product_img4, product_img5, product_img6,
    product_img7, product_img8, product_img9, product_img10, product_img11, product_img12,
}

export const categories = ["Headphones", "Speakers", "Watch", "Earbuds", "Mouse", "Decoration"];

export const dummyRatingsData = [
    { id: "rat_1", rating: 4.2, review: "I was a bit skeptical at first, but this product turned out to be even better than I imagined. The quality feels premium, it's easy to use, and it delivers exactly what was promised. I've already recommended it to friends and will definitely purchase again in the future.", user: { name: 'Kristin Watson', image: profile_pic1 }, productId: "prod_1", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Bluetooth Speakers', category:'Electronics', id:'prod_1'} },
    { id: "rat_2", rating: 5.0, review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", user: { name: 'Jenny Wilson', image: profile_pic2 }, productId: "prod_2", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Bluetooth Speakers', category:'Electronics', id:'prod_1'} },
    { id: "rat_3", rating: 4.1, review: "This product is amazing. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", user: { name: 'Bessie Cooper', image: profile_pic3 }, productId: "prod_3", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Bluetooth Speakers', category:'Electronics', id:'prod_1'} },
    { id: "rat_4", rating: 5.0, review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", user: { name: 'Kristin Watson', image: profile_pic1 }, productId: "prod_4", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Bluetooth Speakers', category:'Electronics', id:'prod_1'} },
    { id: "rat_5", rating: 4.3, review: "Overall, I'm very happy with this purchase. It works as described and feels durable. The only reason I didn't give it five stars is because of a small issue (such as setup taking a bit longer than expected, or packaging being slightly damaged). Still, highly recommend it for anyone looking for a reliable option.", user: { name: 'Jenny Wilson', image: profile_pic2 }, productId: "prod_5", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Bluetooth Speakers', category:'Electronics', id:'prod_1'} },
    { id: "rat_6", rating: 5.0, review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.", user: { name: 'Bessie Cooper', image: profile_pic3 }, productId: "prod_6", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Bluetooth Speakers', category:'Electronics', id:'prod_1'} },
]

export const dummyStoreData = {
    id: "store_1",
    userId: "user_1",
    name: "Happy Shop",
    description: "At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
    username: "happyshop",
    address: "3rd Floor, Happy Shop , New Building, 123 street , c sector , NY, US",
    status: "approved",
    isActive: true,
    logo: happy_store,
    email: "happyshop@example.com",
    contact: "+0 1234567890",
    createdAt: "2025-09-04T09:04:16.189Z",
    updatedAt: "2025-09-04T09:04:44.273Z",
    user: {
        id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
        name: "Great Stack",
        email: "user.greatstack@gmail.com",
        image: gs_logo,
    }
}

export const productDummyData = [
    {
        id: "prod_1",
        name: "Modern table lamp",
        description: "Modern table lamp with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty. Enhance your audio experience with this earbuds. Indulge yourself in a world of pure sound with 50 hours of uninterrupted playtime. Equipped with the cutting-edge Zen Mode Tech ENC and BoomX Tech, prepare to be enthralled by a symphony of crystal-clear melodies.",
        mrp: 40,
        price: 29,
        images: [product_img1, product_img2, product_img3, product_img4],
        category: "Decoration",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_2",
        name: "Smart speaker gray",
        description: "Smart speaker with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 50,
        price: 29,
        images: [product_img2],
        inStock: true,
        store: dummyStoreData,
        category: "Speakers",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_3",
        name: "Smart watch white",
        description: "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 60,
        price: 29,
        images: [product_img3],
        inStock: true,
        store: dummyStoreData,
        category: "Watch",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_4",
        name: "Wireless headphones",
        description: "Wireless headphones with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 70,
        price: 29,
        images: [product_img4],
        inStock: true,
        store: dummyStoreData,
        category: "Headphones",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_5",
        name: "Smart watch black",
        description: "Smart watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 49,
        price: 29,
        images: [product_img5],
        inStock: true,
        store: dummyStoreData,
        category: "Watch",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_6",
        name: "Security Camera",
        description: "Security Camera with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 59,
        price: 29,
        images: [product_img6],
        inStock: true,
        store: dummyStoreData,
        category: "Camera",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_7",
        name: "Smart Pen for iPad",
        description: "Smart Pen for iPad with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 89,
        price: 29,
        images: [product_img7],
        inStock: true,
        store: dummyStoreData,
        category: "Pen",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_8",
        name: "Home Theater",
        description: "Home Theater with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 99,
        price: 29,
        images: [product_img8],
        inStock: true,
        store: dummyStoreData,
        category: "Theater",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_9",
        name: "Apple Wireless Earbuds",
        description: "Apple Wireless Earbuds with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 89,
        price: 29,
        images: [product_img9],
        inStock: true,
        store: dummyStoreData,
        category: "Earbuds",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_10",
        name: "Apple Smart Watch",
        description: "Apple Smart Watch with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 179,
        price: 29,
        images: [product_img10],
        inStock: true,
        store: dummyStoreData,
        category: "Watch",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_11",
        name: "RGB Gaming Mouse",
        description: "RGB Gaming Mouse with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 39,
        price: 29,
        images: [product_img11],
        inStock: true,
        store: dummyStoreData,
        category: "Mouse",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_12",
        name: "Smart Home Cleaner",
        description: "Smart Home Cleaner with a sleek design. It's perfect for any room. It's made of high-quality materials and comes with a lifetime warranty.",
        mrp: 199,
        price: 29,
        images: [product_img12],
        inStock: true,
        store: dummyStoreData,
        category: "Cleaner",
        rating: [...dummyRatingsData,...dummyRatingsData],
        createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
    }
];

export const ourSpecsData = [
    { title: "Free Shipping", description: "Enjoy fast, free delivery on every order no conditions, just reliable doorstep.", icon: SendIcon, accent: '#05DF72' },
    { title: "7 Days easy Return", description: "Change your mind? No worries. Return any item within 7 days.", icon: ClockFadingIcon, accent: '#FF8904' },
    { title: "24/7 Customer Support", description: "We're here for you. Get expert help with our customer support.", icon: HeadsetIcon, accent: '#A684FF' }
]

export const addressDummyData = {
    id: "addr_1",
    userId: "user_1",
    name: "John Doe",
    email: "johndoe@example.com",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA",
    phone: "1234567890",
    createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
}

export const couponDummyData = [
    { code: "NEW20", description: "20% Off for New Users", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
    { code: "NEW10", description: "10% Off for New Users", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:50.653Z" },
    { code: "OFF20", description: "20% Off for All Users", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:00.811Z" },
    { code: "OFF10", description: "10% Off for All Users", discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:21.279Z" },
    { code: "PLUS10", description: "20% Off for Members", discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: "2027-03-06T00:00:00.000Z", createdAt: "2025-08-22T11:38:20.194Z" }
]

export const dummyUserData = {
    id: "user_31dQbH27HVtovbs13X2cmqefddM",
    name: "GreatStack",
    email: "greatstack@example.com",
    image: gs_logo,
    cart: {}
}

export const orderDummyData = [
    {
        id: "cmemm75h5001jtat89016h1p3",
        total: 214.2,
        status: "DELIVERED",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        addressId: "cmemm6g95001ftat8omv9b883",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:15:03.929Z",
        updatedAt: "2025-08-22T09:15:50.723Z",
        isCouponUsed: true,
        coupon: dummyRatingsData[2],
        orderItems: [
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "cmemlydnx0017tat8h3rg92hz", quantity: 1, price: 89, product: productDummyData[0], },
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "cmemlxgnk0015tat84qm8si5v", quantity: 1, price: 149, product: productDummyData[1], }
        ],
        address: addressDummyData,
        user: dummyUserData
    },
    {
        id: "cmemm6jv7001htat8vmm3gxaf",
        total: 421.6,
        status: "DELIVERED",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        addressId: "cmemm6g95001ftat8omv9b883",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:14:35.923Z",
        updatedAt: "2025-08-22T09:15:52.535Z",
        isCouponUsed: true,
        coupon: couponDummyData[0],
        orderItems: [
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemm1f3y001dtat8liccisar", quantity: 1, price: 229, product: productDummyData[2], },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemm0nh2001btat8glfvhry1", quantity: 1, price: 99, product: productDummyData[3], },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemlz8640019tat8kz7emqca", quantity: 1, price: 199, product: productDummyData[4], }
        ],
        address: addressDummyData,
        user: dummyUserData
    }
]

export const storesDummyData = [
    {
        id: "cmemkb98v0001tat8r1hiyxhn",
        userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
        name: "GreatStack",
        description: "GreatStack is the education marketplace where you can buy goodies related to coding and tech",
        username: "greatstack",
        address: "123 Maplewood Drive Springfield, IL 62704 USA",
        status: "approved",
        isActive: true,
        logo: gs_logo,
        email: "greatstack@example.com",
        contact: "+0 1234567890",
        createdAt: "2025-08-22T08:22:16.189Z",
        updatedAt: "2025-08-22T08:22:44.273Z",
        user: dummyUserData,
    },
    {
        id: "cmemkqnzm000htat8u7n8cpte",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        name: "Happy Shop",
        description: "At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
        username: "happyshop",
        address: "3rd Floor, Happy Shop , New Building, 123 street , c sector , NY, US",
        status: "approved",
        isActive: true,
        logo: happy_store,
        email: "happyshop@example.com",
        contact: "+0 123456789",
        createdAt: "2025-08-22T08:34:15.155Z",
        updatedAt: "2025-08-22T08:34:47.162Z",
        user: dummyUserData,
    }
]

export const dummyAdminDashboardData = {
    "orders": 6,
    "stores": 2,
    "products": 12,
    "revenue": "959.10",
    "allOrders": [
        { "createdAt": "2025-08-20T08:46:58.239Z", "total": 145.6 },
        { "createdAt": "2025-08-22T08:46:21.818Z", "total": 97.2 },
        { "createdAt": "2025-08-22T08:45:59.587Z", "total": 54.4 },
        { "createdAt": "2025-08-23T09:15:03.929Z", "total": 214.2 },
        { "createdAt": "2025-08-23T09:14:35.923Z", "total": 421.6 },
        { "createdAt": "2025-08-23T11:44:29.713Z", "total": 26.1 },
        { "createdAt": "2025-08-24T09:15:03.929Z", "total": 214.2 },
        { "createdAt": "2025-08-24T09:14:35.923Z", "total": 421.6 },
        { "createdAt": "2025-08-24T11:44:29.713Z", "total": 26.1 },
        { "createdAt": "2025-08-24T11:56:29.713Z", "total": 36.1 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 26.1 },
        { "createdAt": "2025-08-25T09:15:03.929Z", "total": 214.2 },
        { "createdAt": "2025-08-25T09:14:35.923Z", "total": 421.6 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 26.1 },
        { "createdAt": "2025-08-25T11:56:29.713Z", "total": 36.1 },
        { "createdAt": "2025-08-25T11:30:29.713Z", "total": 110.1 }
    ]
}

export const dummyStoreDashboardData = {
    "ratings": dummyRatingsData,
    "totalOrders": 2,
    "totalEarnings": 636,
    "totalProducts": 5
}

export const allitemsDummyData = [
    {
      id: "prod_almond",
      name: "Almond",
      description:
        "Premium California almonds packed with rich nutrients and a naturally crunchy taste. These almonds are perfect for snacking, gifting, or adding to desserts. Loaded with Vitamin E, antioxidants, and healthy fats, they help boost energy and improve overall wellness. Freshly sourced and hygienically packed to retain their natural goodness.",
      mrp: 520,
      price: 449,
      images: [almond],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_kaju",
      name: "Kaju (Cashews)",
      description:
        "Luxuriously creamy and smooth cashews that melt in your mouth. These premium-quality nuts are rich in healthy fats, minerals, and antioxidants that support heart health and energy levels. Perfect for snacking, cooking, and festive desserts. Carefully selected and processed to deliver unmatched freshness and flavor.",
      mrp: 680,
      price: 599,
      images: [kaju],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_alsi",
      name: "Alsi (Flax Seeds)",
      description:
        "High-quality flax seeds rich in Omega-3 fatty acids, dietary fiber, and plant-based protein. These tiny power-packed seeds support digestion, heart health, and overall wellness. Add them to smoothies, salads, oatmeal, or baking for a crunchy texture and nutrient boost. Freshly packed to preserve natural oils and wholesome benefits.",
      mrp: 180,
      price: 149,
      images: [alsi],
      category: "Seeds",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_dates",
      name: "Dates",
      description:
        "Soft, naturally sweet, and energy-packed dates sourced from premium farms. Each bite delivers natural sugars, fiber, and essential minerals like potassium and magnesium. Perfect as a pre-workout snack or a healthy alternative to sweets. Packed fresh to retain their rich caramel-like taste and chewy texture.",
      mrp: 420,
      price: 369,
      images: [dates],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_kishmish",
      name: "Kishmish (Raisins)",
      description:
        "Juicy, sweet, and sun-dried to perfection, these raisins deliver natural sweetness in every bite. Rich in iron, antioxidants, and natural sugars, they help improve digestion and boost energy. Great for snacking, baking, and garnishing Indian sweets. Packed with care to preserve softness and flavor.",
      mrp: 240,
      price: 199,
      images: [kishmish],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_makhana",
      name: "Makhana (Fox Nuts)",
      description:
        "Light, crunchy, and incredibly nutritious fox nuts harvested from premium sources. These gluten-free superfoods are rich in plant protein, magnesium, and antioxidants. A perfect guilt-free snack that supports weight management and digestive wellness. Roasts beautifully for a delicious, healthy treat anytime.",
      mrp: 350,
      price: 299,
      images: [makhana],
      category: "Healthy Snacks",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_pista",
      name: "Pista (Pistachios)",
      description:
        "Premium roasted pistachios with a satisfying crunch and rich, earthy flavor. Packed with protein, healthy fats, and antioxidants, these nuts are great for mindful snacking. Their vibrant color and unique taste make them perfect for dessert toppings, gifting, or daily nutrition. Sealed fresh to preserve aroma and taste.",
      mrp: 750,
      price: 679,
      images: [pista],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_walnut",
      name: "Walnut",
      description:
        "Handpicked premium walnuts rich in Omega-3 fatty acids and antioxidants. These crunchy halves add wholesome nutrition to your breakfast bowls, salads, and baking. A powerful superfood that supports heart and brain health. Carefully cleaned and sealed to maintain natural flavor and purity.",
      mrp: 650,
      price: 579,
      images: [wallnut],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    }
  ];
  



export const bestSellingDummyData = [
    {
      id: "prod_almond",
      name: "Almond",
      description:
        "Premium California almonds packed with rich nutrients and a naturally crunchy taste. These almonds are perfect for snacking, gifting, or adding to desserts. Loaded with Vitamin E, antioxidants, and healthy fats, they help boost energy and improve overall wellness. Freshly sourced and hygienically packed to retain their natural goodness.",
      mrp: 520,
      price: 449,
      images: [almond],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_kaju",
      name: "Kaju (Cashews)",
      description:
        "Luxuriously creamy and smooth cashews that melt in your mouth. These premium-quality nuts are rich in healthy fats, minerals, and antioxidants that support heart health and energy levels. Perfect for snacking, cooking, and festive desserts. Carefully selected and processed to deliver unmatched freshness and flavor.",
      mrp: 680,
      price: 599,
      images: [kaju],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
      id: "prod_walnut",
      name: "Walnut",
      description:
        "Handpicked premium walnuts rich in Omega-3 fatty acids and antioxidants. These crunchy halves add wholesome nutrition to your breakfast bowls, salads, and baking. A powerful superfood that supports heart and brain health. Carefully cleaned and sealed to maintain natural flavor and purity.",
      mrp: 650,
      price: 579,
      images: [wallnut],
      category: "Dry Fruits",
      inStock: true,
      store: dummyStoreData,
      rating: dummyRatingsData,
      createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    },
    {
        id: "prod_dates",
        name: "Dates",
        description:
          "Soft, naturally sweet, and energy-packed dates sourced from premium farms. Each bite delivers natural sugars, fiber, and essential minerals like potassium and magnesium. Perfect as a pre-workout snack or a healthy alternative to sweets. Packed fresh to retain their rich caramel-like taste and chewy texture.",
        mrp: 420,
        price: 369,
        images: [dates],
        category: "Dry Fruits",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
        updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
      },
  ];
  