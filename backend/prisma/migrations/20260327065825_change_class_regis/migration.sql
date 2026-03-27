/*
  Warnings:

  - You are about to drop the column `scheduled_date` on the `ClassRegistration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[class_id,student_id]` on the table `ClassRegistration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `next_occurrence_at` to the `ClassRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ClassRegistration_class_id_student_id_scheduled_date_key";

-- DropIndex
DROP INDEX "ClassRegistration_student_id_scheduled_date_idx";

-- AlterTable
ALTER TABLE "ClassRegistration" DROP COLUMN "scheduled_date",
ADD COLUMN     "next_occurrence_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ClassRegistration_student_id_next_occurrence_at_idx" ON "ClassRegistration"("student_id", "next_occurrence_at");

-- CreateIndex
CREATE UNIQUE INDEX "ClassRegistration_class_id_student_id_key" ON "ClassRegistration"("class_id", "student_id");
