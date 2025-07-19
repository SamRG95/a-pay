require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'https://bf3f0782eb51.ngrok-free.app',
  credentials: true
}));
app.use(express.json());

// --- IGLESIAS ---
app.get('/iglesias', async (req, res) => {
  try {
    const iglesias = await prisma.iglesia.findMany();
    res.json(iglesias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener iglesias', details: error.message });
  }
});

app.get('/iglesias/:id', async (req, res) => {
  try {
    const iglesia = await prisma.iglesia.findUnique({ where: { idIglesia: Number(req.params.id) } });
    if (!iglesia) return res.status(404).json({ error: 'Iglesia no encontrada' });
    res.json(iglesia);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener iglesia', details: error.message });
  }
});

app.post('/iglesias', async (req, res) => {
  try {
    const nueva = await prisma.iglesia.create({ data: req.body });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear iglesia', details: error.message });
  }
});

app.put('/iglesias/:id', async (req, res) => {
  try {
    const actualizada = await prisma.iglesia.update({ where: { idIglesia: Number(req.params.id) }, data: req.body });
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar iglesia', details: error.message });
  }
});

app.delete('/iglesias/:id', async (req, res) => {
  try {
    await prisma.iglesia.delete({ where: { idIglesia: Number(req.params.id) } });
    res.json({ message: 'Iglesia eliminada' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar iglesia', details: error.message });
  }
});

// --- MODULOS ---
app.get('/modulos', async (req, res) => {
  try {
    const { idIglesia, usuario } = req.query;
    let where = {};
    if (idIglesia) where.idIglesia = Number(idIglesia);
    if (usuario) where.usuario = usuario;
    const modulos = await prisma.modulo.findMany({ where });
    res.json(modulos);
  } catch (error) {
    console.error('Error al obtener modulos:', error);
    res.status(500).json({ error: 'Error al obtener modulos', details: error.message });
  }
});

app.get('/modulos/:id', async (req, res) => {
  try {
    const modulo = await prisma.modulo.findUnique({ where: { idModulo: Number(req.params.id) } });
    if (!modulo) return res.status(404).json({ error: 'Modulo no encontrado' });
    res.json(modulo);
  } catch (error) {
    console.error('Error al obtener modulo:', error);
    res.status(500).json({ error: 'Error al obtener modulo', details: error.message });
  }
});

app.post('/modulos', async (req, res) => {
  try {
    console.log('Datos recibidos para crear módulo:', req.body);
    // 1. Crear el módulo
    const nuevoModulo = await prisma.modulo.create({ data: req.body });
    console.log('Módulo creado:', nuevoModulo);

    // 2. Crear el usuario asociado al módulo
    // Verifica si ya existe un usuario con ese nombre
    const existeUsuario = await prisma.usuario.findFirst({ where: { usuario: req.body.usuario } });
    if (existeUsuario) {
      // Si ya existe, elimina el módulo recién creado para no dejarlo huérfano
      await prisma.modulo.delete({ where: { idModulo: nuevoModulo.idModulo } });
      console.error('Ya existe un usuario con ese nombre de usuario:', req.body.usuario);
      return res.status(400).json({ error: 'Ya existe un usuario con ese nombre de usuario.' });
    }
    let usuarioModulo;
    try {
      usuarioModulo = await prisma.usuario.create({
        data: {
          usuario: req.body.usuario,
          password: req.body.password,
          nombreResponsable: req.body.nombreResponsable || req.body.responsable,
          rol: 'modulo',
          idIglesia: req.body.idIglesia,
          token: req.body.token
        }
      });
      console.log('Usuario de módulo creado:', usuarioModulo);
    } catch (err) {
      // Si falla la creación del usuario, elimina el módulo
      await prisma.modulo.delete({ where: { idModulo: nuevoModulo.idModulo } });
      console.error('Error al crear usuario de módulo:', err);
      return res.status(400).json({ error: 'Error al crear usuario de módulo', details: err.message });
    }

    res.status(201).json({ modulo: nuevoModulo, usuario: usuarioModulo });
  } catch (error) {
    console.error('Error al crear modulo:', error);
    res.status(400).json({ error: 'Error al crear modulo', details: error.message });
  }
});

app.put('/modulos/:id', async (req, res) => {
  try {
    const actualizado = await prisma.modulo.update({ where: { idModulo: Number(req.params.id) }, data: req.body });
    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar modulo:', error);
    res.status(400).json({ error: 'Error al actualizar modulo', details: error.message });
  }
});

app.delete('/modulos/:id', async (req, res) => {
  try {
    await prisma.modulo.delete({ where: { idModulo: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar modulo:', error);
    res.status(400).json({ error: 'Error al eliminar modulo', details: error.message });
  }
});

// --- USUARIOS ---
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { idUsuario: Number(req.params.id) } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario', details: error.message });
  }
});

app.post('/usuarios', async (req, res) => {
  try {
    const nuevo = await prisma.usuario.create({ data: req.body });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear usuario', details: error.message });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const actualizado = await prisma.usuario.update({ where: { idUsuario: Number(req.params.id) }, data: req.body });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario', details: error.message });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    await prisma.usuario.delete({ where: { idUsuario: Number(req.params.id) } });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar usuario', details: error.message });
  }
});

// --- PRODUCTOS ---
app.get('/productos', async (req, res) => {
  try {
    const { idModulo } = req.query;
    const where = idModulo ? { idModulo: Number(idModulo) } : {};
    const productos = await prisma.producto.findMany({ where });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
});

app.get('/productos/:id', async (req, res) => {
  try {
    const producto = await prisma.producto.findUnique({ where: { idProducto: Number(req.params.id) } });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto', details: error.message });
  }
});

app.post('/productos', async (req, res) => {
  try {
    const nuevo = await prisma.producto.create({ data: req.body });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear producto', details: error.message });
  }
});

app.put('/productos/:id', async (req, res) => {
  try {
    const actualizado = await prisma.producto.update({ where: { idProducto: Number(req.params.id) }, data: req.body });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar producto', details: error.message });
  }
});

app.delete('/productos/:id', async (req, res) => {
  try {
    await prisma.producto.delete({ where: { idProducto: Number(req.params.id) } });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar producto', details: error.message });
  }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const user = await prisma.usuario.findFirst({
      where: { usuario },
      include: { iglesia: true }
    });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    // No enviar password en la respuesta
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en login', details: error.message });
  }
});

// --- QR ---

// Listar todos los QRs (admin)
app.get('/qr', async (req, res) => {
  try {
    const { idIglesia } = req.query;
    const where = idIglesia ? { idIglesia: Number(idIglesia) } : {};
    const qrs = await prisma.qrPago.findMany({ where });
    res.json(qrs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener QRs' });
  }
});

// Crear QR (admin)
app.post('/qr', async (req, res) => {
  try {
    const { idIglesia } = req.body;
    const token = uuidv4();
    const qr = await prisma.qrPago.create({
      data: {
        token,
        saldo: 0,
        nombre: 'Sin asignar',
        registrado: false,
        fechaCreacion: new Date(),
        idIglesia,
      }
    });
    res.json(qr);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear QR' });
  }
});

// Activar QR (banco)
app.put('/qr/:idQrPago/activar', async (req, res) => {
  try {
    const { nombre } = req.body;
    const { idQrPago } = req.params;
    const qr = await prisma.qrPago.update({
      where: { idQrPago: Number(idQrPago) },
      data: { nombre, registrado: true }
    });
    res.json(qr);
  } catch (err) {
    res.status(500).json({ error: 'Error al activar QR' });
  }
});

// Recargar saldo (banco)
app.post('/qr/:idQrPago/recargar', async (req, res) => {
  try {
    const { monto } = req.body;
    const { idQrPago } = req.params;
    const qr = await prisma.qrPago.update({
      where: { idQrPago: Number(idQrPago) },
      data: { saldo: { increment: Number(monto) } }
    });
    res.json(qr);
  } catch (err) {
    res.status(500).json({ error: 'Error al recargar saldo' });
  }
});

// Consultar saldo (banco/usuario)
app.get('/qr/:token/saldo', async (req, res) => {
  try {
    const { token } = req.params;
    const qr = await prisma.qrPago.findUnique({
      where: { token },
      select: { saldo: true, nombre: true, registrado: true }
    });
    if (!qr) return res.status(404).json({ error: 'QR no encontrado' });
    res.json(qr);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar saldo' });
  }
});

// Pagar con QR (módulo)
app.post('/qr/:idQrPago/pagar', async (req, res) => {
  try {
    const { monto, descripcion } = req.body;
    const { idQrPago } = req.params;
    // Verificar saldo suficiente
    const qr = await prisma.qrPago.findUnique({ where: { idQrPago: Number(idQrPago) } });
    if (!qr || qr.saldo < monto) return res.status(400).json({ error: 'Saldo insuficiente' });
    // Descontar saldo
    const qrActualizado = await prisma.qrPago.update({
      where: { idQrPago: Number(idQrPago) },
      data: { saldo: { decrement: Number(monto) } }
    });
    res.json(qrActualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar pago' });
  }
});

// Eliminar QR (admin)
app.delete('/qr/:idQrPago', async (req, res) => {
  try {
    await prisma.qrPago.delete({ where: { idQrPago: Number(req.params.idQrPago) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar QR' });
  }
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend escuchando en http://0.0.0.0:${PORT}`);
}); 