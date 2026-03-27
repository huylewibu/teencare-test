/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `day_of_week` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `max_students` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_name` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `time_slot` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Class` table. All the data in the column will be lost.
  - Added the required column `dayOfWeek` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxStudents` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherName` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSlot` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "createdAt",
DROP COLUMN "day_of_week",
DROP COLUMN "max_students",
DROP COLUMN "subject",
DROP COLUMN "teacher_name",
DROP COLUMN "time_slot",
DROP COLUMN "updatedAt",
ADD COLUMN     "dayOfWeek" TEXT NOT NULL,
ADD COLUMN     "maxStudents" INTEGER NOT NULL,
ADD COLUMN     "teacherName" TEXT NOT NULL,
ADD COLUMN     "timeSlot" TEXT NOT NULL;
