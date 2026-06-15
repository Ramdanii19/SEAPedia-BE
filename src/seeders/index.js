import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import Wallet from "../models/wallet.model.js";
import Voucher from "../models/voucher.model.js";
import Promo from "../models/promo.model.js";
import { ROLES, DISCOUNT_TYPE } from "../constants/enums.js";

const DEMO_EMAILS  = ["admin@seapedia.id", "seller@seapedia.id", "buyer@seapedia.id", "driver@seapedia.id", "multi@seapedia.id"];
const VOUCHER_CODES = ["SEAPEDIA10", "HEMAT50K"];
const PROMO_CODES   = ["PROMO20", "SEAFOOD15"];

async function cleanup() {
  const existing = await User.find({ email: { $in: DEMO_EMAILS } });
  const ids = existing.map((u) => u._id);
  if (ids.length) {
    const stores = await Store.find({ seller: { $in: ids } });
    await Product.deleteMany({ store: { $in: stores.map((s) => s._id) } });
    await Store.deleteMany({ seller: { $in: ids } });
    await Wallet.deleteMany({ user: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
  }
  await Voucher.deleteMany({ code: { $in: VOUCHER_CODES } });
  await Promo.deleteMany({ code: { $in: PROMO_CODES } });
}

async function createUser(data) {
  // Gunakan .save() agar pre-save bcrypt hook berjalan (insertMany melewatinya)
  return new User(data).save();
}

async function seed() {
  await connectDB();
  console.log("Seeding database...\n");
  await cleanup();

  // ─── Users ───────────────────────────────────────────────────────────────
  // Admin TIDAK bisa dibuat via POST /auth/register — ADMIN role diblokir dari
  // self-registration. Hanya bisa dibuat via seeder atau insert langsung ke MongoDB.
  const [, sellerUser, buyerUser] = await Promise.all([
    createUser({ fullName: "Admin Seapedia",  email: "admin@seapedia.id",  password: "admin123",  roles: [ROLES.ADMIN],                              activeRole: ROLES.ADMIN  }),
    createUser({ fullName: "Budi Seller",     email: "seller@seapedia.id", password: "seller123", roles: [ROLES.SELLER],                             activeRole: ROLES.SELLER }),
    createUser({ fullName: "Citra Buyer",     email: "buyer@seapedia.id",  password: "buyer123",  roles: [ROLES.BUYER],                              activeRole: ROLES.BUYER  }),
    createUser({ fullName: "Dedi Driver",     email: "driver@seapedia.id", password: "driver123", roles: [ROLES.DRIVER],                             activeRole: ROLES.DRIVER }),
    createUser({ fullName: "Eka Multi-Role",  email: "multi@seapedia.id",  password: "multi123",  roles: [ROLES.BUYER, ROLES.SELLER, ROLES.DRIVER],  activeRole: ROLES.BUYER  }),
  ]);

  // ─── Store & Products ─────────────────────────────────────────────────────
  const store = await Store.create({
    seller:        sellerUser._id,
    storeName:     "Toko Ikan Segar Bu Budi",
    description:   "Jual berbagai jenis ikan segar langsung dari nelayan",
    addressDetail: "Jl. Nelayan No. 5, Muara Baru, Jakarta Utara",
  });

  await Product.insertMany([
    { store: store._id, name: "Ikan Salmon Segar (per kg)",   description: "Salmon import segar, tanpa tulang, siap masak",           price: 120000, stock: 30, imageUrl: "https://placehold.co/400?text=Salmon"   },
    { store: store._id, name: "Udang Vaname (per kg)",        description: "Udang vaname ukuran 30/kg, segar dan bersih",             price:  75000, stock: 50, imageUrl: "https://placehold.co/400?text=Udang"    },
    { store: store._id, name: "Cumi-cumi Segar (per kg)",     description: "Cumi segar ukuran sedang, cocok untuk berbagai masakan",  price:  55000, stock: 40, imageUrl: "https://placehold.co/400?text=Cumi"     },
    { store: store._id, name: "Kepiting Rajungan (per kg)",   description: "Rajungan segar langsung dari tambak, dagingnya tebal",    price:  95000, stock: 20, imageUrl: "https://placehold.co/400?text=Rajungan" },
    { store: store._id, name: "Ikan Kakap Merah (per ekor)", description: "Kakap merah segar, rata-rata 800g per ekor",              price:  65000, stock: 25, imageUrl: "https://placehold.co/400?text=Kakap"    },
  ]);

  // ─── Wallet buyer ─────────────────────────────────────────────────────────
  await Wallet.create({ user: buyerUser._id, balance: 500000 });

  // ─── Vouchers & Promos ───────────────────────────────────────────────────
  const in30d = new Date(Date.now() + 30 * 864e5);
  const in14d = new Date(Date.now() + 14 * 864e5);
  const in7d  = new Date(Date.now() +  7 * 864e5);

  await Voucher.insertMany([
    { name: "Diskon 10% Semua Produk", code: "SEAPEDIA10", discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 10,    remainingUsage: 100, expiryDate: in30d },
    { name: "Hemat Rp50.000",          code: "HEMAT50K",   discountType: DISCOUNT_TYPE.FIXED,      discountValue: 50000, remainingUsage:  50, expiryDate: in30d },
  ]);

  await Promo.insertMany([
    { name: "Promo Pelanggan Baru", code: "PROMO20",    discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 20, expiryDate: in14d },
    { name: "Promo Hari Nelayan",   code: "SEAFOOD15",  discountType: DISCOUNT_TYPE.PERCENTAGE, discountValue: 15, expiryDate: in7d  },
  ]);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("Seed complete!\n");
  console.log("Demo Accounts");
  console.log("  Admin      admin@seapedia.id     password: admin123");
  console.log("  Seller     seller@seapedia.id    password: seller123");
  console.log("  Buyer      buyer@seapedia.id     password: buyer123  (wallet: Rp500.000)");
  console.log("  Driver     driver@seapedia.id    password: driver123");
  console.log("  Multi-role multi@seapedia.id     password: multi123  (BUYER+SELLER+DRIVER)");
  console.log("");
  console.log("Store");
  console.log(`  ${store._id}  |  ${store.storeName}  (5 products)`);
  console.log("");
  console.log("Discount Codes");
  console.log("  Vouchers  SEAPEDIA10 (10%)  |  HEMAT50K (Rp50.000 flat)");
  console.log("  Promos    PROMO20 (20%)     |  SEAFOOD15 (15%)");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
