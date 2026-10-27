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
5. Ex