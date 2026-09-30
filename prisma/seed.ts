import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@oams.shop").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  const passwordHash = await hashPassword(adminPassword ?? "change-me-now");

  await db.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: "OAMS Admin",
      role: Role.ADMIN,
      sellerStatus: "active",
      passwordHash,
    },
  });

  // Seed the default homepage hero slides (safe to re-run).
  const heroSlides: { title: string; imageUrl: string; route: string; sortOrder: number }[] = [
    { title: "OAMS Hero 2", imageUrl: "/imgs/hero-2.jpg", route: "/products", sortOrder: 0 },
    { title: "OAMS Hero", imageUrl: "/imgs/hero.png", route: "/products", sortOrder: 1 },
    { title: "OAMS Collection", imageUrl: "/imgs/home-3.jpg", route: "/products", sortOrder: 2 },
  ];
  for (const s of heroSlides) {
    const existing = await db.heroSlide.findFirst({ where: { imageUrl: s.imageUrl } });
    if (!existing) {
      await db.heroSlide.create({ data: s });
    }
  }

  console.log(`Seeded admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });