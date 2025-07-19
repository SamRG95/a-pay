# Guía Rápida para Desarrolladores - A-Pay

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 14- PostgreSQL
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd a-pay

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma migrate dev

# Iniciar desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

### Frontend (Next.js)
```
pages/           # Páginas de la aplicación
├── _app.js     # Configuración global
├── login.js    # Página de autenticación
├── admin.js    # Dashboard de administrador
├── modulo.js   # Interfaz de módulo
└── banco.js    # Interfaz de banco

components/      # Componentes reutilizables
├── RouteGuard.js    # Protección de rutas
└── ConfirmDialog.js # Modal de confirmación

hooks/          # Custom hooks
├── useAuth.js      # Gestión de autenticación
└── useIsClient.js  # Detección de cliente
```

### Backend (Express)
```
backend/
├── app.js          # Servidor principal
└── prisma/         # Configuración de BD
    └── schema.prisma
```

## 🎨 Convenciones de Diseño

### Colores
- **Primario**: `#FFD700` (Dorado)
- **Secundario**: `#23272b` (Gris oscuro)
- **Fondo**: `#424242 (Gris medio)

### Tipografía
- **Títulos**: Poppins, weight 700 **Texto**: Roboto, weight 400

### Componentes
- Usar Material-UI (MUI)
- Estilado con `sx` prop
- Componentes funcionales con hooks

## 🔧 Flujo de Desarrollo

### 1. Crear Nueva Funcionalidad
```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Desarrollar cambios
# ...

# Commit con mensaje descriptivo
git commit -m "feat: agregar nueva funcionalidad X"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### 2. Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de estilo
refactor: refactorización de código
test: agregar o modificar tests
```

### 3. Naming Conventions
- **Variables**: camelCase
- **Componentes**: PascalCase
- **Archivos**: kebab-case
- **Funciones**: camelCase

## 🔌 API Endpoints Principales

### Autenticación
```javascript
POST /login
Body: { usuario, password }
```

### Módulos
```javascript
GET /modulos?idIglesia=1
POST /modulos
DELETE /modulos/:id
```

### Productos
```javascript
GET /productos?idModulo=1 /productos
DELETE /productos/:id
```

## 🛠️ Herramientas de Desarrollo

### Debugging Frontend
```javascript
// Logs para debugging
console.log('[Component] Estado actual:, state);
console.log('[API] Llamada a endpoint:', endpoint);
```

### Debugging Backend
```javascript
// Logs del servidor
console.log('[API] Request recibido:', req.body);
console.log([DB] Query ejecutada:', query);
```

### Base de Datos
```bash
# Ver datos en desarrollo
npx prisma studio

# Resetear base de datos
npx prisma migrate reset

# Generar cliente
npx prisma generate
```

## 📝 Documentación

### Comentarios en Código
```javascript
/**
 * Función que hace algo específico
 * 
 * @param {string} param1 - Descripción del parámetro
 * @returns {boolean} Descripción del retorno
 * 
 * @example
 * const result = miFuncion('valor);
 */
```

### JSDoc para Componentes
```javascript
/**
 * MiComponente - Descripción del componente
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del componente
 */
```

## 🧪 Testing

### Frontend
```bash
# Ejecutar tests
npm test

# Tests de componentes
npm run test:components
```

### Backend
```bash
# Tests de API
npm run test:api

# Tests de integración
npm run test:integration
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev        # Frontend en puerto 3000
cd backend && npm start  # Backend en puerto 40``

### Producción
```bash
npm run build      # Build de producción
npm start          # Iniciar servidor
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Error de Hidratación
```javascript
// Usar useIsClient hook
const isClient = useIsClient();
if (!isClient) return null;
```

#### Error de CORS
```javascript
// Verificar configuración en backend
app.use(cors({
  origin: http://localhost:300);
```

#### Error de Base de Datos
```bash
# Verificar conexión
npx prisma db push

# Resetear si es necesario
npx prisma migrate reset
```

## 📚 Recursos Útiles

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [Material-UI](https://mui.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)

### Herramientas
- [Postman](https://www.postman.com/) - Testing de API
- [Prisma Studio](https://www.prisma.io/studio) - GUI para BD
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 🤝 Contribución

### Antes de Contribuir
1. Leer la documentación existente2 Revisar issues abiertos
3. Crear rama desde `main`
4. Seguir convenciones de código

### Pull Request
- Título descriptivo
- Descripción detallada
- Screenshots si aplica
- Tests incluidos

### Code Review
- Revisar lógica de negocio
- Verificar seguridad
- Comprobar performance
- Validar UX/UI

---

**¡Gracias por contribuir a A-Pay!** 🎉 