# STFI Frontend

Frontend del Sistema de Gestión de Congresos desarrollado con **React** y **Vite**.

Este proyecto forma parte del Trabajo Final Integrador (TFI) y consume una API REST desarrollada con **Spring Boot**.

---

# Tecnologías utilizadas

- React
- Vite
- JavaScript
- npm
- ESLint
- Docker

---

# Requisitos

## Ejecución local

Antes de ejecutar el proyecto es necesario tener instalado:

- Node.js 24 LTS o superior
- npm

## Ejecución con Docker

Para ejecutar el proyecto mediante Docker es necesario tener instalado:

- Docker Desktop
- Docker Compose

---

# Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al directorio:

```bash
cd stfi-frontend
```

Instalar dependencias:

```bash
npm install
```

---

# Ejecución

## Desarrollo (sin Docker)

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

---

## Ejecución con Docker

Este proyecto puede ejecutarse dentro de un contenedor Docker.

Desde el repositorio **gestion-congresos-deploy**, ejecutar:

```bash
docker compose up --build
```

Una vez iniciados los contenedores, el frontend estará disponible en:

```
http://localhost:5173
```

---

# Comunicación con el Backend

El frontend consume los servicios REST del backend desarrollado con Spring Boot.

Durante el desarrollo, las peticiones HTTP se realizan al backend disponible en:

```
http://localhost:8080
```

Cuando el sistema se ejecuta mediante Docker Compose, la comunicación entre frontend y backend se realiza a través de la red interna de Docker.



---

# Estado del proyecto

Actualmente el proyecto se encuentra en etapa de desarrollo y forma parte del Trabajo Final Integrador (TFI).