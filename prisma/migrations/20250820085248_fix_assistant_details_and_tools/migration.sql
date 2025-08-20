-- AlterTable
ALTER TABLE "assistant_details" ADD COLUMN     "maximum_duration" INTEGER DEFAULT 600,
ADD COLUMN     "model" TEXT DEFAULT 'gemini-2.0-flash-001',
ADD COLUMN     "provider" TEXT DEFAULT 'google',
ADD COLUMN     "selected_voice" TEXT DEFAULT 'zephyr',
ADD COLUMN     "silence_timeout" INTEGER DEFAULT 30,
ADD COLUMN     "temperature" DOUBLE PRECISION DEFAULT 0.7,
ADD COLUMN     "user_prompt" TEXT;

-- CreateTable
CREATE TABLE "assistant_tools" (
    "id" SERIAL NOT NULL,
    "assistant_id" INTEGER NOT NULL,
    "tool_id" TEXT NOT NULL,
    "tool_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_tools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assistant_tools_assistant_id_tool_id_key" ON "assistant_tools"("assistant_id", "tool_id");

-- AddForeignKey
ALTER TABLE "assistant_tools" ADD CONSTRAINT "assistant_tools_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
