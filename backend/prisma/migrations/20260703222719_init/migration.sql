-- CreateEnum
CREATE TYPE "type" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "orderType" AS ENUM ('limit', 'market');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('filled', 'open', 'cancelled');

-- CreateTable
CREATE TABLE "Collateral" (
    "id" TEXT NOT NULL,
    "available" INTEGER NOT NULL,
    "locked" INTEGER NOT NULL,

    CONSTRAINT "Collateral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "type" "type" NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "liquidationPrice" DOUBLE PRECISION NOT NULL,
    "averagePrice" DOUBLE PRECISION NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "type" "type" NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "orderType" "orderType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "status" NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Collateral" ADD CONSTRAINT "Collateral_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
