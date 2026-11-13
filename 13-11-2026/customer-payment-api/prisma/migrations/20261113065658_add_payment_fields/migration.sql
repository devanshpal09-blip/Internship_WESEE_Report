/*
  Warnings:

  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_customer_id_fkey";

-- DropTable
DROP TABLE "customers";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "sessions";

-- DropEnum
DROP TYPE "PaymentStatus";
