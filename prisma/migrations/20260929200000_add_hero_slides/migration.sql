-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "route" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_isActive_idx" ON "HeroSlide"("isActive");

-- Seed the default hero slides from the existing homepage hero imagery.
INSERT INTO "HeroSlide" ("id", "title", "imageUrl", "route", "isActive", "sortOrder", "createdAt", "updatedAt") VALUES
    ('cm0hero0000000000000000001', 'OAMS Hero 2',   '/imgs/hero-2.jpg', '/products', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cm0hero0000000000000000002', 'OAMS Hero',     '/imgs/hero.png',   '/products', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cm0hero0000000000000000003', 'OAMS Collection','/imgs/home-3.jpg', '/products', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;