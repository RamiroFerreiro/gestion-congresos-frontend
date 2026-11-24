# C4T — Frontend Development Workflow

## 1. Objetivo

Este documento establece el flujo de trabajo para desarrollar funcionalidades del frontend de **C4T (Call for Talks)**.

Su propósito es que todos los integrantes del equipo trabajen de manera consistente, manteniendo la calidad del código, la trazabilidad de los requisitos y la colaboración entre desarrolladores.

El equipo utiliza un enfoque de **desarrollo guiado por especificaciones (SDD)**, con Codex como herramienta de asistencia.

**Principio fundamental:** Codex ayuda a analizar, planificar e implementar, pero cada desarrollador es responsable de comprender, revisar y validar los cambios.

## 2. Documentación necesaria

Antes de comenzar una funcionalidad, revisar:

| Documento | Propósito |
|---|---|
| `README.md` | Instalación, ejecución y tecnologías |
| `AGENTS.md` | Convenciones e instrucciones para Codex |
| `docs/FRONTEND-WORKFLOW.md` | Procedimiento de desarrollo |
| `docs/templates/feature-spec.md` | Plantilla de especificación |
| `docs/templates/codex-prompt.md` | Prompts reutilizables para Codex |
| `docs/FE-XX-*.md` | Requisitos y criterios de aceptación |
| `docs/screenshots/` | Referencias visuales aprobadas |

No es necesario leer todas las especificaciones del proyecto. Cada desarrollador debe concentrarse en la documentación de su funcionalidad y en los módulos relacionados.

## 3. Flujo general de desarrollo

Cada funcionalidad atraviesa siete etapas:

1. Selección de la funcionalidad.
2. Revisión de la especificación.
3. Preparación de la rama Git.
4. Análisis y planificación con Codex.
5. Implementación incremental.
6. Validación funcional y técnica.
7. Pull Request y revisión.

Una funcionalidad no se considera integrada hasta que su Pull Request haya sido aprobado y fusionado en `develop`.

---

## 4. Etapa 1 — Seleccionar una funcionalidad

Cada desarrollador toma una tarea del backlog y confirma:

- Identificador de la tarea, por ejemplo `FE-03`.
- Alcance funcional.
- Responsable.
- Dependencias con otras funcionalidades.
- Criterios de aceptación.
- Versión del prototipo utilizada como referencia.

Antes de comenzar, verificar si otro integrante está trabajando sobre los mismos archivos o componentes compartidos.

Si existen dependencias o solapamientos importantes, coordinar el trabajo antes de implementar.

**Resultado esperado:** una tarea identificada, asignada y con alcance claro.

## 5. Etapa 2 — Revisar la especificación

Cada funcionalidad debe contar con una especificación en `docs/`.

Ejemplo:

`docs/FE-03-admin-ui.md`

La especificación debe incluir, según corresponda:

- Objetivo.
- Alcance y exclusiones.
- Pantallas involucradas.
- Reglas de negocio.
- Acciones del usuario.
- Estados y validaciones.
- Integraciones con el backend o uso de mocks.
- Criterios de aceptación.
- Versión del prototipo.
- Referencias visuales.

### Prototipo versionado

C4T dispone de un prototipo que conserva versiones anteriores.

Ejemplo:

https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

Cada funcionalidad debe utilizar la versión aprobada en su especificación.

Si se publica una versión nueva, no debe incorporarse automáticamente a una tarea en desarrollo.

Primero se evalúan los cambios y, si corresponde, se actualiza la especificación.

Las capturas aprobadas se almacenan en `docs/screenshots/`.

### Manejo de ambigüedades

Si un requisito no está definido, presenta contradicciones o depende de una decisión pendiente:

1. Identificar la duda.
2. Consultarla con el equipo o responsable correspondiente.
3. Registrar la decisión en la especificación.
4. Continuar con la implementación.

No utilizar Codex para inventar reglas de negocio.

**Resultado esperado:** una especificación suficientemente clara para comenzar.

## 6. Etapa 3 — Preparar la rama Git

Utilizamos un Git Flow simplificado:

```text
main
 ↑
develop
 ↑
feature/*
```

- `main`: código estable.
- `develop`: rama principal de integración.
- `feature/*`: desarrollo de funcionalidades.

### Crear una rama

Antes de comenzar, verificar que no existan cambios locales que puedan perderse:

```bash
git status
```

Actualizar `develop`:

```bash
git switch develop
git pull --ff-only origin develop
```

Crear la rama de trabajo:

```bash
git switch -c feature/FE-XX-descripcion
```

Ejemplo:

```bash
git switch -c feature/FE-03-admin-ui
```

No desarrollar directamente en `main` ni en `develop`.

Si existen cambios locales pendientes, resolver cómo conservarlos antes de cambiar de rama.

**Resultado esperado:** una rama propia creada desde `develop` actualizado.

## 7. Etapa 4 — Analizar y planificar con Codex

Antes de implementar, solicitar a Codex que analice el contexto.

Codex debe revisar:

1. `AGENTS.md`.
2. `docs/FRONTEND-WORKFLOW.md`.
3. La especificación de la funcionalidad.
4. Las capturas y referencias visuales disponibles.
5. La estructura y el código existente.
6. Los servicios, componentes y tipos reutilizables.

### Solicitud de planificación

Utilizar el prompt de planificación definido en:

`docs/templates/codex-prompt.md`

El plan debe identificar:

- Objetivo de la implementación.
- Componentes existentes que pueden reutilizarse.
- Archivos que será necesario crear o modificar.
- Organización propuesta.
- Manejo de estado y formularios, cuando corresponda.
- Integraciones con el backend o mocks.
- Riesgos, dependencias y dudas.
- Orden de implementación por incrementos.
- Validaciones previstas.

**Codex no debe modificar archivos durante esta etapa.**

### Revisión del plan

El desarrollador debe comprender y evaluar la propuesta.

Antes de aprobar, preguntarse:

- ¿Respeta la especificación?
- ¿Reutiliza correctamente el código existente?
- ¿Introduce complejidad innecesaria?
- ¿Modifica archivos fuera del alcance?
- ¿Puede afectar funcionalidades de otros integrantes?
- ¿Es posible implementarlo en incrementos pequeños?

Si el plan necesita cambios, solicitar ajustes.

**Resultado esperado:** un plan revisado y aprobado por el desarrollador.

## 8. Etapa 5 — Implementar incrementalmente

Una vez aprobado el plan, autorizar únicamente el siguiente incremento.

Ejemplos de incrementos:

- Crear tipos y mocks.
- Implementar una pantalla.
- Incorporar un formulario y sus validaciones.
- Conectar un servicio existente.
- Integrar la navegación.
- Agregar estados de carga y error.

No es necesario utilizar exactamente ese orden: depende de cada funcionalidad.

### Durante la implementación

Codex debe:

- Modificar únicamente los archivos necesarios.
- Respetar las convenciones de `AGENTS.md`.
- Mantener la arquitectura existente.
- Evitar refactorizaciones no solicitadas.
- Explicar decisiones técnicas relevantes.
- No crear commits ni realizar push sin autorización.

Al finalizar cada incremento, el desarrollador debe revisar:

1. Qué archivos cambiaron.
2. Qué comportamiento se incorporó.
3. Si el código es comprensible.
4. Si existen cambios accidentales.
5. Si se respetó el alcance aprobado.

Comandos útiles:

```bash
git status
git diff
```

### Archivos compartidos

Prestar especial atención a:

- `src/app/router.tsx`
- `src/app/providers.tsx`
- `src/app/theme.ts`
- Layouts compartidos.
- Componentes reutilizables.
- Configuración de Axios.
- Tipos y utilidades compartidas.

Si una tarea requiere modificar estos archivos y puede afectar a otro integrante, coordinar el cambio.

### Cambios de alcance

Si durante la implementación surge un requisito nuevo:

1. Evaluar si pertenece a la tarea actual.
2. Confirmarlo con el responsable.
3. Actualizar la especificación si se aprueba.
4. Ajustar el plan antes de implementarlo.

No incorporar funcionalidades adicionales únicamente porque Codex las sugiera.

**Resultado esperado:** incrementos funcionales, revisados y alineados con la especificación.

## 9. Etapa 6 — Validar la funcionalidad

Antes de abrir un Pull Request, realizar validaciones funcionales, visuales y técnicas.

### Validación funcional

Comprobar los criterios de aceptación definidos en la especificación.

Verificar, según corresponda:

- Navegación.
- Formularios y validaciones.
- Acciones del usuario.
- Estados vacíos.
- Estados de carga.
- Mensajes de error y confirmación.
- Permisos y comportamiento por rol.
- Integración con los servicios correspondientes.

### Validación visual

Comparar las pantallas con la versión del prototipo aprobada para la tarea.

Para el MVP, priorizar resoluciones de escritorio, especialmente:

- 1366 × 768.
- 1920 × 1080.

Verificar tipografía, colores, espaciado, alineación y consistencia de los componentes.

### Validación técnica

Ejecutar los comandos disponibles en `package.json`:

```bash
npm run build
npm run lint
npm run format:check
```

El proyecto todavía no dispone de un script específico de pruebas automatizadas ni de verificación independiente de TypeScript.

Si se incorporan estos controles, deberán ejecutarse según la configuración vigente.

### Errores preexistentes

Si una validación falla:

1. Identificar el error.
2. Determinar si fue introducido por la tarea.
3. Corregir los errores propios.
4. Informar los errores preexistentes.
5. Evitar modificaciones fuera del alcance sin aprobación.

No afirmar que una validación fue exitosa si no se ejecutó o si falló.

### Revisión final

Antes del commit:

```bash
git status
git diff
```

Revisar especialmente archivos modificados, código temporal, mocks no previstos, comentarios innecesarios y cambios fuera del alcance.

**Resultado esperado:** funcionalidad validada y lista para revisión.

## 10. Etapa 7 — Commit, Pull Request y revisión

### Preparar el commit

Seleccionar los archivos correspondientes a la tarea.

Ejemplo:

```bash
git add src/features/admin docs/FE-03-admin-ui.md
```

Revisar lo preparado:

```bash
git diff --staged
```

Crear el commit siguiendo la convención:

```text
type[TICKET]: short description
```

Ejemplo:

```bash
git commit -m "feat[FE-03]: add administrator congress selection page"
```

Los mensajes de commit se escriben en inglés.

### Publicar la rama

```bash
git push -u origin feature/FE-03-admin-ui
```

### Abrir el Pull Request

Crear un Pull Request en GitHub:

**Origen:** `feature/FE-03-admin-ui`

**Destino:** `develop`

El PR debe incluir:

- Identificador y objetivo de la FT.
- Resumen de los cambios.
- Referencia a la especificación.
- Versión del prototipo utilizada.
- Evidencia visual cuando corresponda.
- Validaciones ejecutadas y resultados.
- Limitaciones o pendientes conocidos.

### Revisión

Otro integrante debe revisar el Pull Request antes de integrarlo.

La revisión debe verificar:

- Cumplimiento de la especificación.
- Calidad y claridad del código.
- Ausencia de cambios fuera del alcance.
- Consistencia con la arquitectura.
- Posibles efectos sobre otras funcionalidades.
- Evidencia de validación.

Si se solicitan cambios, realizarlos en la misma rama y actualizar el Pull Request.

Una vez aprobado y con las validaciones necesarias, integrar la rama en `develop` desde GitHub.

**No realizar merges locales ni push directo a `develop`.**

La integración de `develop` hacia `main` también se realiza mediante Pull Request cuando el equipo acuerda publicar una versión estable.

**Resultado esperado:** funcionalidad revisada e integrada en `develop`.

## 11. Actualizar una feature con cambios de develop

Cuando otros integrantes integran funcionalidades, puede ser necesario actualizar una rama en progreso.

Primero, verificar que los cambios locales estén guardados de forma segura:

```bash
git status
```

Luego:

```bash
git fetch origin
git switch feature/FE-XX-descripcion
git merge origin/develop
```

Si aparecen conflictos:

1. Identificar los archivos afectados.
2. Comprender ambos cambios.
3. Coordinar con los responsables cuando corresponda.
4. Resolver los conflictos.
5. Ejecutar nuevamente las validaciones.

No utilizar comandos destructivos ni descartar cambios para resolver conflictos sin comprender su impacto.

## 12. Buenas prácticas para el trabajo en equipo

- Mantener las tareas acotadas.
- Evitar que dos integrantes modifiquen simultáneamente los mismos componentes compartidos sin coordinación.
- Revisar el código generado por Codex antes de incorporarlo.
- No introducir dependencias sin justificación.
- No modificar módulos ajenos para resolver problemas no relacionados.
- Registrar las decisiones funcionales en las especificaciones.
- Mantener identificada la versión del prototipo de cada FT.
- Comunicar bloqueos y dependencias con anticipación.
- Mantener `develop` estable y compilable.
- Priorizar la comprensión del código por encima de la velocidad de generación.

## 13. Checklist de finalización

Antes de solicitar la revisión del Pull Request:

- [ ] La funcionalidad cumple los criterios de aceptación.
- [ ] Se utilizó la versión aprobada del prototipo.
- [ ] Los cambios respetan el alcance acordado.
- [ ] El código sigue las convenciones de `AGENTS.md`.
- [ ] Se revisaron los archivos modificados.
- [ ] Se ejecutaron las validaciones técnicas correspondientes.
- [ ] Se comprobaron los flujos funcionales relevantes.
- [ ] Se verificó la interfaz visualmente cuando corresponde.
- [ ] Se documentaron errores preexistentes o limitaciones.
- [ ] El Pull Request apunta a `develop`.
- [ ] Se solicitó revisión a otro integrante.

---

**Regla general del equipo:** especificar antes de implementar, comprender antes de aprobar e integrar únicamente cambios revisados.