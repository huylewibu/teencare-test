/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `maxStudents` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `teacherName` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `timeSlot` on the `Class` table. All the data in the column will be lost.
  - Added the required column `day_of_week` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_students` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_name` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_slot` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "dayOfWeek",
DROP COLUMN "maxStudents",
DROP COLUMN "teacherName",
DROP COLUMN "timeSlot",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "day_of_week" TEXT NOT NULL,
ADD COLUMN     "max_students" INTEGER NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "teacher_name" TEXT NOT NULL,
ADD COLUMN     "time_slot" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
