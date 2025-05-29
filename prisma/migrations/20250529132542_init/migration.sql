/*
  Warnings:

  - You are about to drop the column `acciones` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descrpcion" TEXT NOT NULL,
    "precio" DECIMAL NOT NULL,
    "stock" INTEGER NOT NULL
);
INSERT INTO "new_Product" ("descrpcion", "id", "precio", "stock") SELECT "descrpcion", "id", "precio", "stock" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
