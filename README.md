# A-Pay - Sistema de Gestión para Iglesias

## 📋 Descripción del Proyecto

A-Pay es un sistema de gestión integral diseñado específicamente para iglesias, que permite administrar módulos de venta, usuarios bancarios, códigos QR y transacciones. El sistema está construido con tecnologías modernas y ofrece una interfaz intuitiva para diferentes roles de usuario.

## 🏗️ Arquitectura del Sistema

### Frontend
- **Framework**: Next.js con React
- **UI Library**: Material-UI (MUI)
- **Estilado**: CSS-in-JS con sx prop
- **Estado**: React Hooks (useState, useEffect)
- **Rutas**: Next.js Router

### Backend
- **Runtime**: Node.js con Express
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (simulado con localStorage)

## 👥 Roles de Usuario

### 1. **Admin**
- Gestión completa de módulos de venta
- Creación y administración de usuarios banco
- Generación de códigos QR
- Visualización de reportes y cancelaciones
- Acceso a todas las funcionalidades del sistema

### 2. **Módulo** (Vendedor)
- Interfaz de venta simplificada
- Gestión de productos del módulo asignado
- Procesamiento de transacciones
- Visualización de inventario

### 3. **Banco**
- Gestión de transacciones financieras
- Validación de códigos QR
- Procesamiento de pagos
- Reportes de movimientos

## 📁 Estructura del Proyecto

```
a-pay/
├── pages/                 # Páginas de Next.js
│   ├── _app.js           # Configuración global de la app
│   ├── _document.js      # Configuración del HTML
│   ├── index.js          # Página principal
│   ├── login.js          # Página de autenticación
│   ├── admin.js          # Dashboard de administrador
│   ├── modulo.js         # Interfaz de módulo de venta
│   └── banco.js          # Interfaz de banco
├── components/            # Componentes reutilizables
│   ├── RouteGuard.js     # Protección de rutas
│   └── ConfirmDialog.js  # Diálogo de confirmación
├── hooks/                # Custom hooks
│   ├── useAuth.js        # Gestión de autenticación
│   └── useIsClient.js    # Detección de cliente
├── backend/              # API del servidor
│   ├── app.js           # Servidor Express
│   └── prisma/          # Configuración de base de datos
├── public/               # Archivos estáticos
└── prisma/              # Migraciones y esquema de BD
```

## 🚀 Funcionalidades Principales

### Autenticación y Autorización
- Sistema de login con validación de credenciales
- Protección de rutas basada en roles
- Redirección automática según permisos
- Gestión de sesiones con localStorage

### Gestión de Módulos
- Creación de módulos de venta
- Asignación de responsables
- Gestión de productos por módulo
- Eliminación segura con confirmación

### Gestión de Productos
- Agregar productos con emojis como imágenes
- Establecer precios
- Eliminación individual con confirmación
- Visualización en tarjetas atractivas

### Gestión de Usuarios Banco
- Creación de cuentas bancarias
- Asignación por iglesia
- Interfaz de gestión de transacciones

### Códigos QR
- Generación de códigos QR únicos
- Asignación de saldos
- Descarga de códigos generados
- Gestión de propietarios

## �� Características de Diseño

### Tema Visual
- **Colores principales**: Dorado (#FFD700) y gris oscuro (#23272
- **Tipografía**: Poppins para títulos, Roboto para texto
- **Iconografía**: Material Icons
- **Efectos**: Sombras, gradientes y destellos dorados

### Componentes Personalizados
- **RouteGuard**: Protección de rutas con loading states
- **ConfirmDialog**: Modal de confirmación reutilizable
- **Tarjetas de módulos**: Diseño con iconos animados
- **Formularios**: Validación y feedback visual

## 🔧 Configuración y Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- PostgreSQL
- npm o yarn

### Instalación
1lonar el repositorio
2talar dependencias: `npm install`
3. Configurar variables de entorno
4. Ejecutar migraciones: `npx prisma migrate dev`
5. Iniciar servidor de desarrollo: `npm run dev`

### Variables de Entorno
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/a-pay"
JWT_SECRET="tu-secreto-jwt"
```

## 📊 Base de Datos

### Entidades Principales
- **Usuarios**: Administradores, módulos, bancos
- **Iglesias**: Organizaciones que usan el sistema
- **Módulos**: Puntos de venta
- **Productos**: Items vendibles por módulo
- **Transacciones**: Registro de ventas
- **Códigos QR**: Tokens de pago

## 🔒 Seguridad

### Autenticación
- Validación de credenciales en backend
- Tokens JWT para sesiones
- Protección de rutas por rol
- Logout seguro

### Validación
- Sanitización de inputs
- Validación en frontend y backend
- Manejo de errores consistente
- Confirmaciones para acciones destructivas

## 🚀 Despliegue

### Frontend
- Build de producción: `npm run build`
- Optimización automática de imágenes
- Compresión de assets

### Backend
- Servidor Express optimizado
- CORS configurado
- Rate limiting implementado
- Logs de errores

## 🤝 Contribución

### Guías para Colaboradores
1. Revisar la documentación existente
2. Seguir las convenciones de código3 Probar cambios en desarrollo
4. Documentar nuevas funcionalidades
5. Crear pull requests descriptivos

### Convenciones de Código
- **JavaScript**: ES6+ con async/await
- **React**: Functional components con hooks
- **CSS**: Material-UI sx prop
- **Naming**: camelCase para variables, PascalCase para componentes

## 📝 Notas de Desarrollo

### Estado Actual
- ✅ Autenticación implementada
- ✅ Protección de rutas funcional
- ✅ Gestión de módulos completa
- ✅ Gestión de productos con confirmaciones
- ✅ Interfaz de banco básica
- ✅ Diseño responsivo y atractivo

### Próximas Mejoras
- Reportes avanzados
-  Notificaciones en tiempo real
- portación de datos
- [ ] Backup automático
- Múltiples idiomas

## 📞 Soporte

Para dudas técnicas o problemas:
- Revisar la documentación de componentes
- Verificar logs del servidor
- Consultar esquema de base de datos
- Contactar al equipo de desarrollo

---

**A-Pay** - Sistema de Gestión para Iglesias  
*Desarrollado con ❤️ para la comunidad*
