-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "trackingNumber" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "trackingNumber" TEXT;

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");
