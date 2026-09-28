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