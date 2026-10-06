-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT;
