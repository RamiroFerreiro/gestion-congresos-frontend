# Estrategia de Branching - Gestión de Congresos Backend

## Introducción

Este documento define la estrategia de trabajo con ramas (*branching
strategy*) utilizada en el proyecto **Gestión de Congresos Frontend**.

El objetivo es mantener un flujo de trabajo ordenado, permitir el
desarrollo paralelo entre integrantes del equipo y reducir conflictos al
momento de integrar cambios.

La estrategia elegida está basada en un **Git Flow simplificado**,
adaptado a las necesidades del proyecto.

------------------------------------------------------------------------

# Estructura de ramas

``` text
main
  ↑
develop
  ↑
feature/*
```

## Rama `main`

-   Contiene únicamente código estable.
-   No se desarrolla directamente sobre ella.
-   Recibe cambios desde `develop`.

## Rama `develop`

-   Rama principal de integración.
-   Base para crear nuevas `feature/*`.
-   Debe mantenerse compilable.

## Ramas `feature/*`

Ejemplos:

-   `feature/auth`
-   `feature/usuarios`
-   `feature/trabajos`
-   `feature/evaluaciones`
-   `feature/project-structure`

Cada rama se crea desde `develop` y se integra nuevamente mediante Pull
Request.

# Flujo de trabajo

## Actualizar develop

``` bash
git checkout develop
git pull origin develop
```

## Crear una feature

``` bash
git checkout -b feature/nombre-funcionalidad
```

## Trabajar y confirmar cambios

``` bash
git add .
git commit -m "Descripción del cambio"
```

## Subir la rama

``` bash
git push origin feature/nombre-funcionalidad
```

## Crear Pull Request

    feature/*
        ↓
     develop

# Actualizar una feature con cambios de develop

Si no hay cambios sin commit:

``` bash
git checkout develop
git pull origin develop

git checkout feature/nombre-funcionalidad
git merge develop
```

Si hay cambios sin commit:

``` bash
git stash

git checkout develop
git pull origin develop

git checkout feature/nombre-funcionalidad
git merge develop

git stash pop
```

# Uso de git stash

Utilizar `git stash` para guardar temporalmente cambios sin commit y
`git stash pop` para recuperarlos posteriormente.

# Convenciones de commits

Ejemplos recomendados:

-   `Implementa endpoint para crear usuarios`
-   `Configura arquitectura base del backend`
-   `Agrega validaciones para entidad Trabajo`

Evitar mensajes como:

-   `Cambios`
-   `Update`
-   `Fix`

# Recomendaciones

-   No hacer `push` directo a `main`.
-   No desarrollar directamente sobre `develop`.
-   Crear una rama por funcionalidad.
-   Actualizar `develop` antes de comenzar una nueva tarea.
-   Integrar cambios frecuentemente.
-   Mantener el proyecto compilable.

# Resumen visual

``` text
                main
                 ↑
             develop
          ↑     ↑     ↑
 feature/auth feature/users feature/trabajos
```
