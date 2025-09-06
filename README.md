# Gestión de Proyectos - CRUD FullStack 🚀

## Descripción 📋
Sistema completo de gestión de proyectos y desarrolladores con relaciones muchos-a-muchos. Desarrollado con Angular 19 + PrimeNG en el frontend y .NET 8 Web API en el backend.

## Tecnologías🛠️
### Frontend
🔹 Angular 19 - Framework principal

🔹 PrimeNG - Componentes UI

🔹 Angular Signals - Gestión de estado

🔹 Standalone Components - Arquitectura moderna

🔹 TypeScript - Lenguaje de programación

### Backend
🔹.NET 8 - Framework API

🔹 Entity Framework Core - ORM Database-First

🔹 SQL Server - Base de datos

🔹 C# - Lenguaje de programación

### Base de Datos
🔹SQL Server - Motor de base de datos

🔹 Stored Procedures - Para consultas complejas

🔹 Soft Delete - Eliminación lógica

## Requisitos Previos ⚙️
🔹Node.js 18+

🔹.NET 8 SDK

🔹SQL Server Express

🔹Angular CLI 19+

🔹Git

## Instalación y Ejecución 🚀
#### 1. Clonar el Repositorio
   
```
git clone https://github.com/EstefaniaTellez/proyecto-fullstack-crud
cd proyecto-fullstack-crud
```

#### 2. Configurar Base de Datos
  Ejecutar scripts SQL en /db/

  La base de datos se creará automáticamente

#### 3. Backend (.NET API)
```
cd backend/ProjectManagement.API
# Restaurar paquetes
dotnet restore
# Ejecutar la aplicación
dotnet run
```
Aparece en la consola
```
API disponible en: http://localhost:5261
```
Por lo que el Swagger estará disponible en: http://localhost:5261/swagger

#### 4. Frontend (Angular)
```
cd frontend/project-management-ui
# Instalar dependencias
npm install
# Ejecutar la aplicación
ng serve
```
Por lo que el Frontend estará disponible en: http://localhost:4200

### Funcionalidades 🎯
#### Proyectos
✅ CRUD completo de proyectos

✅ Estados: Planificado, En Progreso, Pausado, Cerrado

#### Desarrolladores
✅ CRUD completo de desarrolladores

✅ Niveles: Junior, Semi-Senior, Senior

✅ Estado activo/inactivo

#### Asignaciones
✅ Asignar desarrolladores a proyectos

✅ Roles y horas semanales

✅ Validación de horarios (1-40 horas)
