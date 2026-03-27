/*
  Warnings:

  - You are about to drop the column `startAt` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_id` on the `ClassRegistration` table. All the data in the column will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[class_id,student_id,scheduled_date]` on the table `ClassRegistration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scheduled_date` to the `ClassRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClassRegistration" DROP CONSTRAINT "ClassRegistration_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_student_id_fkey";

-- DropIndex
DROP INDEX "ClassRegistration_class_id_student_id_key";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "startAt";

-- AlterTable
ALTER TABLE "ClassRegistration" DROP COLUMN "subscription_id",
ADD COLUMN     "scheduled_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "student_subscription_id" INTEGER;

-- DropTable
DROP TABLE "Subscription";

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "total_sessions" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSubscription" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subscription_plan_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_sessions_snapshot" INTEGER NOT NULL,
    "used_sessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE INDEX "StudentSubscription_student_id_idx" ON "StudentSubscription"("student_id");

-- CreateIndex
CREATE INDEX "StudentSubscription_subscription_plan_id_idx" ON "StudentSubscription"("subscription_plan_id");

-- CreateIndex
CREATE INDEX "ClassRegistration_student_id_scheduled_date_idx" ON "ClassRegistration"("student_id", "scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "ClassRegistration_class_id_student_id_scheduled_date_key" ON "ClassRegistration"("class_id", "student_id", "scheduled_date");

-- AddForeignKey
ALTER TABLE "StudentSubscription" ADD CONSTRAINT "StudentSubscription_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubscription" ADD CONSTRAINT "StudentSubscription_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRegistration" ADD CONSTRAINT "ClassRegistration_student_subscription_id_fkey" FOREIGN KEY ("student_subscription_id") REFERENCES "StudentSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
