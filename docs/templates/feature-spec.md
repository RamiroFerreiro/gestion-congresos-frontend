# FE-XX — Nombre de la funcionalidad

## 1. Información general

- **ID:** FE-XX
- **Nombre:** Nombre de la funcionalidad
- **Responsable:** Por definir
- **Estado:** Pendiente / En desarrollo / En revisión / Finalizada
- **Rama:** `feature/FE-XX-descripcion`
- **Versión del prototipo:** `0.7.5` (reemplazar por la versión aprobada)
- **URL del prototipo:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

## 2. Objetivo

Describir brevemente qué problema resuelve la funcionalidad y qué resultado se espera obtener.

## 3. Alcance

### Incluye

- Funcionalidad o pantalla incluida.
- Acciones que podrá realizar el usuario.
- Comportamientos y estados que deben implementarse.

### No incluye

- Funcionalidades que quedan fuera de esta tarea.
- Integraciones o mejoras previstas para futuras tareas.

## 4. Usuarios y permisos

Indicar qué roles pueden acceder a la funcionalidad y qué acciones tienen permitidas.

| Rol | Acceso / acciones |
|---|---|
| Administrador | Por definir |
| Presentador | Por definir |
| Evaluador | Por definir |
| Oyente | Por definir |

Eliminar las filas que no correspondan.

## 5. Pantallas y flujo de usuario

Describir las pantallas involucradas y cómo navega el usuario entre ellas.

Para cada pantalla, indicar:

- Punto de entrada.
- Información mostrada.
- Acciones disponibles.
- Resultado de cada acción.
- Estados relevantes (vacío, carga, error, éxito, etc.).

### Referencias visuales

- **Versión aprobada del prototipo:** `0.7.5`
- **Capturas:** `docs/screenshots/nombre-captura.png`

Si el prototipo cambia, evaluar el impacto antes de actualizar la versión de referencia.

## 6. Reglas de negocio

Documentar las reglas que condicionan el comportamiento de la funcionalidad.

Ejemplos de formato:

- RN-01: Descripción de la regla.
- RN-02: Descripción de la regla.

No agregar reglas que no hayan sido acordadas.

Si una regla depende del backend, indicar esa dependencia.

## 7. Datos e integración

**Modalidad:** Backend real / Mocks tipados / Mixta.

### Datos necesarios

Describir qué información necesita mostrar o modificar la funcionalidad.

### Servicios involucrados

| Operación | Endpoint / servicio | Estado |
|---|---|---|
| Operación requerida | Por confirmar | Disponible / Pendiente |

Consultar Swagger/OpenAPI y los servicios existentes antes de completar contratos de API.

Si se utilizan mocks, indicar qué datos representan y qué comportamiento se simula.

No inventar endpoints ni estructuras de respuesta.

## 8. Validaciones y manejo de errores

Indicar, cuando corresponda:

- Campos obligatorios.
- Restricciones de formato.
- Mensajes de validación.
- Estados de carga.
- Manejo de errores del backend.
- Confirmaciones de acciones.
- Comportamiento ante datos vacíos.

## 9. Criterios de aceptación

Definir condiciones verificables para considerar completa la funcionalidad.

- [ ] CA-01: El usuario puede realizar la acción esperada.
- [ ] CA-02: La pantalla muestra correctamente los datos definidos.
- [ ] CA-03: Se respetan las reglas de negocio.
- [ ] CA-04: Se contemplan los estados y errores aplicables.
- [ ] CA-05: La interfaz coincide con la referencia visual aprobada.

Reemplazar estos ejemplos por criterios específicos de la tarea.

## 10. Dependencias y decisiones pendientes

### Dependencias

- Otras funcionalidades necesarias.
- Servicios de backend pendientes.
- Componentes compartidos que deban coordinarse.

### Decisiones pendientes

- Duda o definición necesaria.
- Responsable de resolverla.

Si una decisión pendiente impide implementar correctamente una parte de la funcionalidad, resolverla antes de avanzar sobre esa parte.

## 11. Notas de implementación

Sección opcional para registrar decisiones técnicas relevantes que afecten la tarea.

Ejemplos:

- Reutilizar un componente existente.
- Mantener un mock hasta disponer del endpoint.
- Coordinar cambios en el router con otro integrante.

No utilizar esta sección para duplicar instrucciones generales de `AGENTS.md`.

## 12. Verificación final

- [ ] Se cumplen los criterios de aceptación.
- [ ] Se respetó el alcance aprobado.
- [ ] Se utilizó la versión correcta del prototipo.
- [ ] Se revisaron los cambios realizados.
- [ ] Se ejecutaron las validaciones técnicas correspondientes.
- [ ] Se documentaron limitaciones o pendientes.
- [ ] El Pull Request fue creado hacia `develop`.