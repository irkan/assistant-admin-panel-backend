-- CreateTable
CREATE TABLE "avatar_images" (
    "id" SERIAL NOT NULL,
    "assistant_id" INTEGER NOT NULL,
    "image_data" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "avatar_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "avatar_images" ADD CONSTRAINT "avatar_images_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
