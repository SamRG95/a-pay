# Backend A-Pay - API Documentation

## 📋 Descripción

El backend de A-Pay es un servidor Express que proporciona una API RESTful para el sistema de gestión de iglesias. Maneja autenticación, gestión de módulos, productos, usuarios y transacciones.

## 🏗️ Arquitectura

### Tecnologías
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (simulado)

### Estructura
```
backend/
├── app.js              # Servidor principal
├── prisma/             # Configuración de base de datos
│   ├── schema.prisma   # Esquema de la base de datos
│   └── migrations/     # Migraciones de la base de datos
└── README.md          # Esta documentación
```

## 🚀 Configuración

### Variables de Entorno
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/a-pay"
PORT=4000
NODE_ENV=development
```

### Instalación
```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor
npm start
```

## 📊 Base de Datos

### Esquema Principal

#### Usuarios
```sql
- idUsuario (PK)
- usuario (unique)
- password (hasheada)
- rol (admin, modulo, banco)
- nombreResponsable
- token
- idIglesia (FK)
```

#### Iglesias
```sql
- idIglesia (PK)
- nombreIglesia
- direccion
- telefono
```

#### Módulos
```sql
- idModulo (PK)
- nombreModulo
- nombreResponsable
- usuario (FK a Usuarios)
- imagenModulo
- idIglesia (FK)
```

#### Productos
```sql
- idProducto (PK)
- nombreProducto
- precio
- urlImage (emoji o URL)
- idModulo (FK)
```

## 🔌 Endpoints de la API

### Autenticación

#### POST /login
Autentica un usuario y retorna sus datos.

**Request:**
```json
{
 usuario": "admin,
  ssword": "password123"
}
```

**Response:**
```json
[object Object] idUsuario:1usuario:admin, rol": admin,
  nombreResponsable": "Admin Principal,
 idIglesia":1}
```

### Gestión de Módulos

#### GET /modulos
Obtiene todos los módulos de una iglesia específica.

**Query Parameters:**
- `idIglesia` (required): ID de la iglesia

**Response:**
```json
[
  [object Object]
    idModulo":1
    nombreModulo": Cafetería",
    nombreResponsable": Ana López",
   usuario:ana.cafe",
  idIglesia":1}
]
```

#### POST /modulos
Crea un nuevo módulo.

**Request:**
```json[object Object]
  nombreModulo":Nuevo Módulo",
  nombreResponsable:Juan Pérez,usuario: juan.modulo,
  ssword: password123
 token:token-juan.modulo,imagenModulo": null,
 idIglesia": 1
}
```

#### DELETE /modulos/:id
Elimina un módulo específico.

### Gestión de Productos

#### GET /productos
Obtiene productos de un módulo específico.

**Query Parameters:**
- `idModulo` (required): ID del módulo

**Response:**
```json
[
 [object Object]
   idProducto": 1,
   nombreProducto:Café Americano",
   precio: 2500
   urlImage:☕,
    idModulo":1}
]
```

#### POST /productos
Crea un nuevo producto.

**Request:**
```json[object Object]
  idModulo": 1,
 nombreProducto:Nuevo Producto,
  precio": 150.50
 urlImage": "🍪"
}
```

#### DELETE /productos/:id
Elimina un producto específico.

### Gestión de Usuarios

#### GET /usuarios
Obtiene todos los usuarios (filtrado por rol si se especifica).

#### POST /usuarios
Crea un nuevo usuario (admin, modulo, banco).

**Request:**
```json[object Object]
 usuario": nuevo.usuario,
  ssword: password123",
  nombreResponsable: Responsable",
 token: oken-nuevo.usuario",
  rol:modulo,
 idIglesia":1}
```

### Gestión de Iglesias

#### GET /iglesias
Obtiene todas las iglesias registradas.

#### POST /iglesias
Crea una nueva iglesia.

## 🔒 Seguridad

### Validaciones
- Sanitización de inputs
- Validación de tipos de datos
- Verificación de permisos por rol
- Manejo de errores consistente

### Autenticación
- Validación de credenciales
- Tokens de sesión
- Protección de endpoints sensibles

## 📝 Logs y Debugging

### Logs del Servidor
```javascript
console.log('[API] Endpoint llamado:', endpoint);
console.log([DB] Query ejecutada:, query);
console.log('[AUTH] Usuario autenticado:,usuario);
```

### Debugging
- Usar `console.log` para debugging
- Verificar logs del servidor
- Revisar respuestas de la base de datos
- Validar estructura de requests

## 🚀 Despliegue

### Producción
```bash
# Build de producción
npm run build

# Iniciar servidor
npm start
```

### Variables de Entorno de Producción
```env
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/a-pay-prod"
PORT=4000
NODE_ENV=production
```

## 🤝 Contribución

### Guías para el Backend
1. Seguir las convenciones de Prisma
2. Validar todos los inputs
3nejar errores apropiadamente
4. Documentar nuevos endpoints
5. Probar con datos reales

### Convenciones
- **Endpoints**: RESTful con nombres descriptivos
- **Responses**: JSON consistente con códigos HTTP apropiados
- **Errores**: Mensajes descriptivos y códigos de estado correctos
- **Logs**: Informativos para debugging

---

**Backend A-Pay** - API del Sistema de Gestión para Iglesias 