import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError } from "axios";
import { getCongressAvailability } from "../lib/congressAvailability.ts";
import { getCongressError } from "../lib/congressErrors.ts";
import { institutionSchema } from "../schemas/institutionSchema.ts";

const congress = {
  enabled: true,
  registrationStartDate: "2026-11-01T09:00:00",
  registrationEndDate: "2026-11-15T18:00:00",
  presentationStartDate: "2026-11-16T09:00:00",
  presentationEndDate: "2026-11-20T18:00:00",
  startDate: "2026-11-25T09:00:00",
  endDate: "2026-11-28T18:00:00",
};
const availability = (date, overrides = {}) =>
  getCongressAvailability({ ...congress, ...overrides }, new Date(date));

test("la inscripción incluye los instantes de apertura y cierre", () => {
  for (const date of [
    congress.registrationStartDate,
    "2026-11-12T12:00:00",
    congress.registrationEndDate,
  ]) {
    assert.equal(availability(date).canRegister, true);
  }
});

test("antes de abrir y después de cerrar no se permite inscripción", () => {
  assert.equal(availability("2026-11-01T08:59:59").canRegister, false);
  assert.equal(availability("2026-11-15T18:00:01").canRegister, false);
  assert.equal(
    availability("2026-11-01T08:59:59").label,
    "Inscripción próximamente",
  );
});

test("recepción de trabajos abierta no implica inscripción abierta", () => {
  const state = availability("2026-11-17T12:00:00");
  assert.equal(state.label, "Recepción abierta");
  assert.equal(state.canRegister, false);
});

test("el congreso finalizado permanece identificable y no permite inscripción", () => {
  const state = availability("2026-11-29T12:00:00");
  assert.equal(state.label, "Finalizado");
  assert.equal(state.canRegister, false);
});

test("ni un congreso deshabilitado ni uno finalizado permiten inscripción aunque las fechas sean inconsistentes", () => {
  assert.equal(
    availability("2026-11-12T12:00:00", { enabled: false }).canRegister,
    false,
  );
  assert.equal(
    availability("2026-11-29T12:00:00", {
      registrationEndDate: "2026-12-01T18:00:00",
    }).canRegister,
    false,
  );
});

test("institución obligatoria, normalizada y de hasta 255 caracteres", () => {
  assert.equal(
    institutionSchema.safeParse({ institution: "  " }).success,
    false,
  );
  assert.equal(
    institutionSchema.safeParse({ institution: "a".repeat(256) }).success,
    false,
  );
  assert.equal(
    institutionSchema.safeParse({ institution: "a".repeat(255) }).success,
    true,
  );
  assert.equal(
    institutionSchema.parse({ institution: " UNLa " }).institution,
    "UNLa",
  );
});

test("conserva el mensaje del backend para una inscripción dada de baja", () => {
  const error = new AxiosError("Request failed");
  error.response = {
    status: 400,
    data: {
      message:
        "Debés comunicarte con la administración para solicitar su reactivación.",
    },
  };
  assert.equal(getCongressError(error), error.response.data.message);
});

test("distingue sesión vencida y error de conexión", () => {
  const expired = new AxiosError("Unauthorized");
  expired.response = { status: 401, data: {} };
  assert.match(getCongressError(expired), /sesión venció/);
  assert.match(getCongressError(new AxiosError("Network Error")), /conectar/);
});
