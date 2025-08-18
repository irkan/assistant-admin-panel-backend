/*
  Warnings:

  - You are about to drop the `agent_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `agents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "agent_details" DROP CONSTRAINT "agent_details_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "agents" DROP CONSTRAINT "agents_organization_id_fkey";

-- DropTable
DROP TABLE "agent_details";

-- DropTable
DROP TABLE "agents";

-- CreateTable
CREATE TABLE "assistants" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "assistants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_details" (
    "assistant_id" INTEGER NOT NULL,
    "first_message" TEXT,
    "system_prompt" TEXT,
    "interaction_mode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "assistant_details_pkey" PRIMARY KEY ("assistant_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assistants_organization_id_name_key" ON "assistants"("organization_id", "name");

-- AddForeignKey
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_details" ADD CONSTRAINT "assistant_details_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
