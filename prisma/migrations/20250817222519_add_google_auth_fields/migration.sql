/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[short_name]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - Made the column `short_name` on table `organizations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "short_name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_short_name_key" ON "organizations"("short_name");
