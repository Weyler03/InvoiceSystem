-- CreateTable
CREATE TABLE "Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL,
    "cedulaRNC" TEXT
);
