-- CreateTable
CREATE TABLE "Iglesia" (
    "idIglesia" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "responsable" VARCHAR(100) NOT NULL,

    CONSTRAINT "Iglesia_pkey" PRIMARY KEY ("idIglesia")
);

-- CreateTable
CREATE TABLE "Modulo" (
    "idModulo" SERIAL NOT NULL,
    "nombreModulo" VARCHAR(50) NOT NULL,
    "nombreResponsable" VARCHAR(50) NOT NULL,
    "usuario" VARCHAR(70) NOT NULL,
    "password" VARCHAR(70) NOT NULL,
    "token" VARCHAR(80) NOT NULL,
    "imagenModulo" VARCHAR(70),
    "idIglesia" INTEGER NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("idModulo")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "usuario" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL,
    "nombreResponsable" VARCHAR(100) NOT NULL,
    "token" VARCHAR(80) NOT NULL,
    "rol" VARCHAR(30) NOT NULL,
    "idIglesia" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Producto" (
    "idProducto" SERIAL NOT NULL,
    "idModulo" INTEGER NOT NULL,
    "nombreProducto" VARCHAR(50) NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "urlImage" VARCHAR(100),

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("idProducto")
);

-- CreateTable
CREATE TABLE "QrPago" (
    "idQrPago" SERIAL NOT NULL,
    "token" VARCHAR(80) NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "registrado" BOOLEAN NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL,
    "idIglesia" INTEGER NOT NULL,

    CONSTRAINT "QrPago_pkey" PRIMARY KEY ("idQrPago")
);

-- CreateTable
CREATE TABLE "Corte" (
    "idCorte" SERIAL NOT NULL,
    "fechaCorte" TIMESTAMP(3) NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "nombreRecolector" VARCHAR(50) NOT NULL,
    "idIglesia" INTEGER NOT NULL,

    CONSTRAINT "Corte_pkey" PRIMARY KEY ("idCorte")
);

-- CreateTable
CREATE TABLE "Abono" (
    "idAbono" SERIAL NOT NULL,
    "idQrPago" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "fechaAbono" TIMESTAMP(3) NOT NULL,
    "idCorte" INTEGER,

    CONSTRAINT "Abono_pkey" PRIMARY KEY ("idAbono")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "idPedido" SERIAL NOT NULL,
    "idQrPago" INTEGER NOT NULL,
    "cantidadProductoTotal" INTEGER NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "entregado" BOOLEAN NOT NULL,
    "fechaPedido" TIMESTAMP(3) NOT NULL,
    "tipoPedido" VARCHAR(50) NOT NULL,
    "cancelado" BOOLEAN NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("idPedido")
);

-- CreateTable
CREATE TABLE "Compra" (
    "idCompra" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "fechaCompra" TIMESTAMP(3) NOT NULL,
    "nombreProductoOriginal" VARCHAR(50) NOT NULL,
    "precioOriginal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("idCompra")
);

-- CreateTable
CREATE TABLE "Transpaso" (
    "idTranspaso" SERIAL NOT NULL,
    "fechaTranspaso" TIMESTAMP(3) NOT NULL,
    "idQrPagoEnvio" INTEGER NOT NULL,
    "idQrPagoSalio" INTEGER NOT NULL,

    CONSTRAINT "Transpaso_pkey" PRIMARY KEY ("idTranspaso")
);

-- CreateTable
CREATE TABLE "SolicitudCancelacion" (
    "idSolicitudCancelacion" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL,
    "atendida" BOOLEAN NOT NULL,
    "realizada" BOOLEAN NOT NULL,

    CONSTRAINT "SolicitudCancelacion_pkey" PRIMARY KEY ("idSolicitudCancelacion")
);

-- CreateTable
CREATE TABLE "Complemento" (
    "idComplemento" SERIAL NOT NULL,
    "nombreComplemento" VARCHAR(50) NOT NULL,

    CONSTRAINT "Complemento_pkey" PRIMARY KEY ("idComplemento")
);

-- CreateTable
CREATE TABLE "ComplementoProducto" (
    "idComplementoProducto" SERIAL NOT NULL,
    "idComplemento" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,

    CONSTRAINT "ComplementoProducto_pkey" PRIMARY KEY ("idComplementoProducto")
);

-- CreateTable
CREATE TABLE "ComplementoCompra" (
    "idComplementoCompra" SERIAL NOT NULL,
    "idComplemento" INTEGER NOT NULL,
    "idCompra" INTEGER NOT NULL,

    CONSTRAINT "ComplementoCompra_pkey" PRIMARY KEY ("idComplementoCompra")
);

-- AddForeignKey
ALTER TABLE "Modulo" ADD CONSTRAINT "Modulo_idIglesia_fkey" FOREIGN KEY ("idIglesia") REFERENCES "Iglesia"("idIglesia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_idIglesia_fkey" FOREIGN KEY ("idIglesia") REFERENCES "Iglesia"("idIglesia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idModulo_fkey" FOREIGN KEY ("idModulo") REFERENCES "Modulo"("idModulo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrPago" ADD CONSTRAINT "QrPago_idIglesia_fkey" FOREIGN KEY ("idIglesia") REFERENCES "Iglesia"("idIglesia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corte" ADD CONSTRAINT "Corte_idIglesia_fkey" FOREIGN KEY ("idIglesia") REFERENCES "Iglesia"("idIglesia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abono" ADD CONSTRAINT "Abono_idQrPago_fkey" FOREIGN KEY ("idQrPago") REFERENCES "QrPago"("idQrPago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abono" ADD CONSTRAINT "Abono_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abono" ADD CONSTRAINT "Abono_idCorte_fkey" FOREIGN KEY ("idCorte") REFERENCES "Corte"("idCorte") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idQrPago_fkey" FOREIGN KEY ("idQrPago") REFERENCES "QrPago"("idQrPago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "Pedido"("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transpaso" ADD CONSTRAINT "Transpaso_idQrPagoEnvio_fkey" FOREIGN KEY ("idQrPagoEnvio") REFERENCES "QrPago"("idQrPago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transpaso" ADD CONSTRAINT "Transpaso_idQrPagoSalio_fkey" FOREIGN KEY ("idQrPagoSalio") REFERENCES "QrPago"("idQrPago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCancelacion" ADD CONSTRAINT "SolicitudCancelacion_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "Pedido"("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplementoProducto" ADD CONSTRAINT "ComplementoProducto_idComplemento_fkey" FOREIGN KEY ("idComplemento") REFERENCES "Complemento"("idComplemento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplementoProducto" ADD CONSTRAINT "ComplementoProducto_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplementoCompra" ADD CONSTRAINT "ComplementoCompra_idComplemento_fkey" FOREIGN KEY ("idComplemento") REFERENCES "Complemento"("idComplemento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplementoCompra" ADD CONSTRAINT "ComplementoCompra_idCompra_fkey" FOREIGN KEY ("idCompra") REFERENCES "Compra"("idCompra") ON DELETE RESTRICT ON UPDATE CASCADE;
