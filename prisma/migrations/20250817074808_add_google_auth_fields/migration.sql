-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'email';
