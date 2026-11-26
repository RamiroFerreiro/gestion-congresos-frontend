# FE-06 — Corrección y reenvío de trabajos científicos

## 1. Información general

- **ID:** FE-06
- **Nombre:** Corrección y reenvío de trabajos científicos
- **Responsable:** Maximiliano Calahorra
- **Estado:** En desarrollo
- **Rama:** `feature/FE-06-paper-resubmission`
- **Versión del prototipo:** `0.7.5`
- **URL del prototipo:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

## 2. Objetivo

Permitir que el autor responsable corrija y reenvíe un trabajo cuyo dictamen
actual sea `NEEDS_REVISION`, respetando la observación y el plazo liberados por
la evaluación.

## 3. Alcance

### Incluye

- Ruta `/congresses/:congressCode/papers/:paperCode/correction`.
- Consulta del trabajo, participación, reglas de presentación e historial de
  evaluaciones liberadas.
- Visualización de la última observación que solicita correcciones, su versión,
  fecha y plazo límite.
- Edición de título, área temática, palabras clave y resumen enriquecido.
- Guardado de cambios sin reenviar el trabajo.
- Reenvío de la versión corregida a evaluación.
- Visualización de autores `ACCEPTED` e instituciones en modo sólo lectura.
- Navegación al detalle del trabajo con confirmación luego del reenvío.

### No incluye

- Agregar, quitar, ordenar o aceptar autores y solicitudes de coautoría.
- Registrar una explicación textual de los cambios realizados.
- Editar un trabajo en estados distintos de `NEEDS_REVISION`.
- Bandeja de trabajos propios, evaluación, asignación de evaluadores,
  notificaciones o cambios de backend.

## 4. Usuarios y permisos

| Usuario                      | Acceso / acciones                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Autor responsable `ACCEPTED` | Puede corregir, guardar cambios y reenviar mientras el trabajo esté en `NEEDS_REVISION` y el plazo siga vigente. |
| Coautor `ACCEPTED`           | Puede consultar el detalle, pero no ingresar ni operar la corrección.                                            |

El backend conserva la decisión final sobre autenticación, participación,
institución, estado editable y plazo de reenvío.

## 5. Pantallas y flujo de usuario

El autor responsable accede desde `Corregir y reenviar` en el detalle FE-05.
La pantalla presenta la evaluación liberada más reciente con resultado
`NEEDS_REVISION`, seguida por el formulario con la versión actual del trabajo.

Los autores aceptados se muestran sólo para consulta: no hay controles para
agregar, quitar ni modificar coautores. La ausencia de un campo de explicación
de cambios es intencional: el contrato actual no admite persistirlo.

`Guardar cambios` conserva el estado `NEEDS_REVISION`. `Reenviar versión
corregida` persiste los datos y llama a la operación de envío. Ante éxito, la
aplicación redirige al detalle del trabajo y muestra una confirmación; el
backend determina el nuevo estado `UNDER_EVALUATION`.

El botón `Cancelar` vuelve al detalle. El retorno temporal `← Volver a Mis
trabajos` del detalle continúa redirigiendo a `/congresses` hasta que se
implemente la bandeja de trabajos.

### Referencias visuales

- **Versión aprobada del prototipo:** `0.7.5`.
- **Captura:** `docs/screenshots/participant-resubmit-paper.png`.

La captura no debe incluir el bloque `Cambios realizados` ni controles para
modificar autores.

## 6. Reglas de negocio

- RN-01: Sólo el autor responsable de un trabajo `NEEDS_REVISION` puede
  corregirlo o reenviarlo.
- RN-02: Los autores aceptados y su orden se mantienen inmutables luego del
  primer envío.
- RN-03: La corrección requiere una evaluación liberada con resultado
  `NEEDS_REVISION` y fecha límite válida no vencida.
- RN-04: El congreso debe encontrarse habilitado. La validación final de plazo,
  estado y fecha de inicio del congreso corresponde al backend.
- RN-05: Las reglas de área temática y palabras clave son las configuradas por
  el congreso. Al reenviar se requieren título, área, resumen y el mínimo de
  palabras clave correspondiente.
- RN-06: Si el backend devuelve `409` por solicitudes pendientes, se informa el
  conflicto sin descartarlas ni reintentar la operación.
- RN-07: En simple ciego se muestra el evaluador sólo si el backend lo entrega;
  en doble ciego no se muestra identidad ni un marcador alternativo.

## 7. Datos e integración

**Modalidad:** Backend real.

| Operación                    | Endpoint / servicio                                 | Estado     |
| ---------------------------- | --------------------------------------------------- | ---------- |
| Reglas del congreso          | `GET /api/congresses/{code}/paper-submission-rules` | Disponible |
| Participación actual         | `GET /api/congresses/{code}/participants/me`        | Disponible |
| Detalle del trabajo          | `GET /api/papers/{paperCode}`                       | Disponible |
| Historial liberado           | `GET /api/evaluations/paper/{paperCode}`            | Disponible |
| Actualizar metadatos         | `PUT /api/papers/{paperCode}`                       | Disponible |
| Agregar/quitar palabra clave | Endpoints individuales de palabras clave            | Disponible |
| Reenviar trabajo             | `PATCH /api/papers/{paperCode}/submit`              | Disponible |

El formulario reutiliza React Hook Form, Zod, Axios y TanStack Query ya
incorporados por FE-04. No se agrega estado global ni dependencias nuevas.

## 8. Validaciones y manejo de errores

- Mientras se cargan trabajo, reglas, participación o evaluación se muestra un
  estado de carga.
- Acceso no autorizado, participación inválida, trabajo ajeno o estado distinto
  de `NEEDS_REVISION` se informan sin habilitar edición.
- Plazo ausente, inválido o vencido deshabilita guardar y reenviar.
- Los mensajes del backend se muestran cuando están disponibles; los errores de
  solicitudes pendientes no habilitan descarte desde esta pantalla.
- Las fechas se presentan en español argentino.

## 9. Criterios de aceptación

- [ ] CA-01: El autor responsable accede a la ruta de corrección desde el
      detalle cuando el trabajo está en `NEEDS_REVISION`.
- [ ] CA-02: Coautores, usuarios ajenos y trabajos en otros estados no pueden
      editar ni reenviar.
- [ ] CA-03: La pantalla muestra observación, versión evaluada, fecha y plazo
      de la evaluación que solicita correcciones.
- [ ] CA-04: En simple ciego se visualiza el evaluador cuando el backend lo
      informa; en doble ciego no se expone su identidad.
- [ ] CA-05: Se pueden actualizar metadatos, palabras clave y resumen usando
      las validaciones configuradas para el congreso.
- [ ] CA-06: Los autores se muestran en sólo lectura, sin acciones de alta,
      baja u ordenamiento.
- [ ] CA-07: Guardar cambios mantiene el estado `NEEDS_REVISION`.
- [ ] CA-08: Reenviar una corrección válida redirige al detalle y confirma el
      envío a evaluación.
- [ ] CA-09: Un plazo vencido, un congreso deshabilitado o un `409` bloquean la
      operación sin modificar autores ni solicitudes.
- [ ] CA-10: La vista coincide con la captura aprobada en 1366 × 768 y
      1920 × 1080, sin desbordamiento horizontal.

## 10. Dependencias y decisiones pendientes

### Dependencias

- FE-05 integrada para ofrecer el punto de entrada desde el detalle.
- Backend con la evaluación histórica liberada y sus plazos de corrección.
- Futura bandeja de trabajos propios para reemplazar el retorno temporal del
  detalle.

### Decisiones pendientes

No hay decisiones funcionales pendientes que bloqueen esta implementación.

## 11. Verificación final

- [ ] Se cumplen los criterios de aceptación.
- [ ] Se respetó el alcance y la referencia visual aprobada.
- [ ] Se ejecutaron type-check, lint/formato focalizado y build.
- [ ] Se validaron manualmente plazo vigente, plazo vencido, simple ciego,
      doble ciego, acceso de coautor y conflicto por solicitudes pendientes.
- [ ] El Pull Request fue creado hacia `develop` y recibió revisión.
