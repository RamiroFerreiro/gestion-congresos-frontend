# C4T — Plantilla de prompts para Codex

## 1. Objetivo

Este documento contiene prompts reutilizables para trabajar con Codex durante el desarrollo del frontend de C4T.

El equipo utiliza una metodología de desarrollo guiado por especificaciones (SDD), con implementación incremental y revisión humana.

Los prompts complementan las instrucciones de `AGENTS.md` y el procedimiento de `docs/FRONTEND-WORKFLOW.md`.

**Regla principal:** Codex no debe modificar archivos hasta que el desarrollador haya revisado y aprobado un plan.

---

## 2. Prompt 1 — Análisis y planificación

**Cuándo utilizarlo:** al comenzar una nueva funcionalidad o un conjunto de cambios que requiera planificación.

Reemplazar los valores entre corchetes antes de enviarlo.

### Prompt

```text
Vamos a trabajar en la funcionalidad [FE-XX — NOMBRE].

Antes de proponer cambios, revisá:

1. AGENTS.md.
2. docs/FRONTEND-WORKFLOW.md.
3. La especificación docs/[ARCHIVO-DE-LA-FT].md.
4. Las capturas relevantes de docs/screenshots/.
5. La estructura y el código existente relacionado con esta funcionalidad.

La versión aprobada del prototipo es [VERSIÓN].
Referencia: [URL-DEL-PROTOTIPO-VERSIONADO].

El alcance de esta sesión es:
[DESCRIBIR EL ALCANCE CONCRETO].

Quiero que trabajemos siguiendo SDD y de manera incremental.

Por ahora, NO modifiques ningún archivo.

Primero necesito que:

1. Resumas qué debemos implementar y los criterios de aceptación relevantes.
2. Identifiques qué partes ya existen y cuáles faltan.
3. Propongas una solución que respete la arquitectura actual.
4. Indiques qué archivos crearías o modificarías.
5. Expliques cómo organizarías la implementación en incrementos pequeños.
6. Identifiques dependencias, riesgos, dudas y decisiones pendientes.
7. Propongas cómo validarías cada incremento.

No agregues funcionalidades que estén fuera del alcance de la especificación.

Si encontrás contradicciones entre la especificación,
las capturas y el código existente, señalalas antes
de proponer una implementación.

Esperá mi aprobación antes de modificar archivos.
```

---

## 3. Prompt 2 — Implementación incremental

**Cuándo utilizarlo:** después de revisar y aprobar el plan propuesto por Codex.

No utilizar este prompt si todavía existen dudas funcionales o decisiones pendientes que afecten la implementación.

### Prompt

```text
Aprobamos el plan de implementación para
[FE-XX — NOMBRE].

Vamos a implementar únicamente el siguiente incremento:

[DESCRIBIR EL INCREMENTO APROBADO].

Tené en cuenta:

1. Respetar AGENTS.md y docs/FRONTEND-WORKFLOW.md.
2. Seguir la especificación aprobada de la funcionalidad.
3. Utilizar las capturas y la versión del prototipo
   definidas para este incremento.
4. Reutilizar componentes, servicios y patrones existentes
   cuando corresponda.
5. Mantener la implementación simple, clara y mantenible.
6. No modificar funcionalidades ajenas al incremento.
7. No incorporar dependencias nuevas sin justificarlas
   y solicitar aprobación.
8. No modificar contratos de API ni reglas de negocio
   sin autorización.
9. Mantener la tipificación de TypeScript y las convenciones
   del repositorio.
10. No realizar commits, push ni merges.

Implementá únicamente este incremento.

Al finalizar:

1. Resumí los cambios realizados.
2. Enumerá los archivos creados o modificados.
3. Indicá qué criterios de aceptación se cumplen.
4. Ejecutá las validaciones técnicas disponibles
   que correspondan al cambio.
5. Informá los resultados reales de esas validaciones.
6. Señalá cualquier limitación o pendiente.

No avances al siguiente incremento sin mi aprobación.
```

---

## 4. Prompt 3 — Revisión final

**Cuándo utilizarlo:** cuando se completó un incremento o una funcionalidad y queremos revisar los cambios antes de crear la Pull Request.

### Prompt

```text
Terminamos la implementación de
[FE-XX — NOMBRE].

Quiero que realices una revisión final de los cambios
antes de preparar la Pull Request.

Por ahora, NO modifiques archivos.

Revisá:

1. AGENTS.md y docs/FRONTEND-WORKFLOW.md.
2. La especificación de la funcionalidad.
3. Los criterios de aceptación aplicables.
4. Las capturas y referencias visuales aprobadas.
5. El código implementado y los cambios respecto
   de la rama base develop.

Necesito que verifiques:

1. Que la implementación respete el alcance aprobado.
2. Que no existan modificaciones innecesarias
   en funcionalidades ajenas.
3. Que se reutilicen correctamente los componentes
   y patrones existentes.
4. Que los formularios y validaciones cumplan
   las reglas de negocio especificadas.
5. Que no existan errores evidentes de navegación,
   tipado o manejo de estados.
6. Que no se hayan incorporado dependencias
   injustificadas.
7. Que las validaciones técnicas relevantes
   se hayan ejecutado correctamente.

Ejecutá las comprobaciones disponibles que no
modifiquen archivos, cuando corresponda.

Presentá el resultado indicando:

- Criterios de aceptación cumplidos.
- Problemas encontrados, ordenados por prioridad.
- Riesgos o limitaciones.
- Validaciones ejecutadas y sus resultados.
- Recomendaciones antes de crear la Pull Request.

No corrijas automáticamente los problemas encontrados.
Primero presentá el diagnóstico y esperá mi aprobación.
```

---

## 5. Recomendaciones de uso

- Utilizar el **Prompt 1** antes de comenzar una funcionalidad o incremento.
- Revisar el plan y resolver las dudas antes de aprobar la implementación.
- Utilizar el **Prompt 2** únicamente para el incremento aprobado.
- Revisar el resultado antes de avanzar al siguiente incremento.
- Utilizar el **Prompt 3** antes de crear la Pull Request.
- Mantener actualizada la especificación cuando se aprueben cambios funcionales o visuales.
- No utilizar Codex para realizar commits, push o merges sin autorización explícita.

## 6. Flujo resumido

**Especificación → Planificación → Aprobación → Implementación incremental → Validación → Revisión → Pull Request hacia `develop`.**

La responsabilidad de aprobar decisiones técnicas, verificar el resultado y autorizar la integración del código corresponde siempre al equipo de desarrollo.