-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_idModulo_fkey";

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idModulo_fkey" FOREIGN KEY ("idModulo") REFERENCES "Modulo"("idModulo") ON DELETE CASCADE ON UPDATE CASCADE;
