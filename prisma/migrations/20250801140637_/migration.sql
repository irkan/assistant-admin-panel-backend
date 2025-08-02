-- AlterTable
ALTER TABLE "agent_details" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "agents" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL;
