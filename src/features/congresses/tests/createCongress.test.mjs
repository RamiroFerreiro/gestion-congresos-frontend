import assert from "node:assert/strict";
import test from "node:test";
import {
  createCongressDefaults,
  createCongressSchema,
} from "../schemas/createCongressSchema.ts";
import {
  getCongressCreationMessage,
  toCreateCongressRequest,
} from "../lib/congressCreation.ts";

function validForm(overrides = {}) {
  return {
    ...globalThis.structuredClone(createCongressDefaults),
    name: "  Congreso de alimentos  ",
    place: "  Lanús  ",
    contactMail: " contacto@example.org ",
    thematicAreas: [{ name: " Alimentos " }],
    registrationStartDate: "2099-01-01T08:00",
    registrationEndDate: "2099-02-01T08:00",
    presentationStartDate: "2099-02-01T08:00",
    presentationEndDate: "2099-03-01T08:00",
    startDate: "2099-04-01T08:00",
    endDate: "2099-04-02T18:00",
    ...overrides,
  };
}
function paidForm(overrides = {}) {
  return validForm({
    paid: true,
    abstractAmount: "1250.50",
    abstractCurrency: " ars ",
    bankDetails: {
      bankName: " Banco ",
      accountHolder: " Titular ",
      cbuCvu: "1234567890123456789012",
      cuitCuil: "20-12345678-9",
      alias: " congreso.test ",
    },
    ...overrides,
  });
}
function hasIssue(data, path) {
  const result = createCongressSchema.safeParse(data);
  return (
    !result.success &&
    result.error.issues.some((issue) => issue.path.join(".") === path)
  );
}

test("el formulario gratuito válido genera el contrato JSON real y normaliza texto", () => {
  const payload = toCreateCongressRequest(
    createCongressSchema.parse(validForm()),
  );
  assert.equal(payload.name, "Congreso de alimentos");
  assert.equal(payload.place, "Lanús");
  assert.deepEqual(payload.thematicAreas, ["Alimentos"]);
  assert.equal(payload.contactMail, "contacto@example.org");
  assert.equal(payload.free, true);
  assert.equal(payload.singleBlind, true);
  assert.equal(payload.bankDetailRequestDTO, null);
  assert.equal(payload.abstractAmount, 0);
  assert.equal(payload.abstractCurrency, null);
  assert.equal(payload.plannedEvaluationReleaseDate, null);
  assert.equal("isFree" in payload, false);
  assert.equal("isSingleBlind" in payload, false);
});

test("las fechas locales conservan día y hora sin conversión a UTC", () => {
  const payload = toCreateCongressRequest(
    createCongressSchema.parse(validForm()),
  );
  assert.equal(payload.registrationStartDate, "2099-01-01T08:00:00");
  assert.equal(payload.endDate, "2099-04-02T18:00:00");
  assert.equal(payload.startDate.endsWith("Z"), false);
});

test("se permiten límites ausentes e igualdad entre el fin y el inicio de etapas distintas", () => {
  assert.equal(
    createCongressSchema.safeParse(
      validForm({
        maxNumberOfAuthors: null,
        minKeywords: null,
        maxKeywords: null,
      }),
    ).success,
    true,
  );
});

test("se rechazan rangos iguales o invertidos y etapas superpuestas", () => {
  assert.ok(
    hasIssue(
      validForm({ registrationEndDate: "2099-01-01T08:00" }),
      "registrationEndDate",
    ),
  );
  assert.ok(hasIssue(validForm({ endDate: "2099-03-31T18:00" }), "endDate"));
  assert.ok(
    hasIssue(
      validForm({ presentationStartDate: "2099-01-20T08:00" }),
      "presentationStartDate",
    ),
  );
});

test("todas las fechas deben existir y ser futuras", () => {
  for (const name of [
    "registrationStartDate",
    "registrationEndDate",
    "presentationStartDate",
    "presentationEndDate",
    "startDate",
    "endDate",
  ]) {
    assert.ok(hasIssue(validForm({ [name]: "2000-01-01T08:00" }), name));
    assert.ok(hasIssue(validForm({ [name]: "" }), name));
  }
  assert.ok(
    hasIssue(validForm({ startDate: "2099-02-31T08:00" }), "startDate"),
  );
  assert.ok(hasIssue(validForm({ startDate: "no es una fecha" }), "startDate"));
});

test("nombre, sede, contacto y áreas son obligatorios, sin áreas duplicadas", () => {
  for (const name of ["name", "place", "contactMail"])
    assert.ok(hasIssue(validForm({ [name]: " " }), name));
  assert.ok(hasIssue(validForm({ contactMail: "correo" }), "contactMail"));
  assert.ok(hasIssue(validForm({ thematicAreas: [] }), "thematicAreas"));
  assert.ok(
    hasIssue(
      validForm({ thematicAreas: [{ name: " " }] }),
      "thematicAreas.0.name",
    ),
  );
  assert.ok(
    hasIssue(
      validForm({ thematicAreas: [{ name: "Área" }, { name: " Área " }] }),
      "thematicAreas.1.name",
    ),
  );
});

test("los límites son enteros positivos y el mínimo no supera el máximo", () => {
  assert.ok(
    hasIssue(validForm({ maxNumberOfAuthors: 0 }), "maxNumberOfAuthors"),
  );
  assert.ok(hasIssue(validForm({ minKeywords: 1.5 }), "minKeywords"));
  assert.ok(
    hasIssue(validForm({ minKeywords: 6, maxKeywords: 5 }), "maxKeywords"),
  );
});

test("BATCH exige una fecha futura y la envía como LocalDateTime", () => {
  assert.ok(
    hasIssue(
      validForm({ evaluationReleaseMode: "BATCH" }),
      "plannedEvaluationReleaseDate",
    ),
  );
  assert.ok(
    hasIssue(
      validForm({
        evaluationReleaseMode: "BATCH",
        plannedEvaluationReleaseDate: "2000-01-01T08:00",
      }),
      "plannedEvaluationReleaseDate",
    ),
  );
  const payload = toCreateCongressRequest(
    createCongressSchema.parse(
      validForm({
        evaluationReleaseMode: "BATCH",
        plannedEvaluationReleaseDate: "2099-03-15T10:30",
      }),
    ),
  );
  assert.equal(payload.plannedEvaluationReleaseDate, "2099-03-15T10:30:00");
});

test("IMMEDIATE y gratuito descartan configuraciones ocultas de un modo previo", () => {
  const payload = toCreateCongressRequest(
    createCongressSchema.parse(
      validForm({
        plannedEvaluationReleaseDate: "2000-01-01T08:00",
        abstractAmount: "importe inválido",
        abstractCurrency: "moneda inválida",
      }),
    ),
  );
  assert.equal(payload.plannedEvaluationReleaseDate, null);
  assert.equal(payload.bankDetailRequestDTO, null);
  assert.equal(payload.abstractAmount, 0);
});

test("el congreso pago envía importe, moneda normalizada y la cuenta anidada", () => {
  const payload = toCreateCongressRequest(
    createCongressSchema.parse(paidForm({ singleBlind: false })),
  );
  assert.equal(payload.free, false);
  assert.equal(payload.singleBlind, false);
  assert.equal(payload.abstractAmount, 1250.5);
  assert.equal(payload.abstractCurrency, "ARS");
  assert.equal(payload.bankDetailRequestDTO.bankName, "Banco");
  assert.equal(payload.bankDetailRequestDTO.alias, "congreso.test");
});

test("el importe pago respeta la precisión DECIMAL(10,2)", () => {
  for (const amount of ["", "0", "-1", "1.234", "100000000", "NaN", "1e3"]) {
    assert.ok(hasIssue(paidForm({ abstractAmount: amount }), "abstractAmount"));
  }
  assert.equal(
    createCongressSchema.safeParse(paidForm({ abstractAmount: "99999999.99" }))
      .success,
    true,
  );
  assert.ok(hasIssue(paidForm({ abstractCurrency: "AR" }), "abstractCurrency"));
});

test("el pago exige los cinco datos bancarios y sus longitudes reales", () => {
  assert.ok(
    hasIssue(
      paidForm({ bankDetails: createCongressDefaults.bankDetails }),
      "bankDetails.bankName",
    ),
  );
  const bank = paidForm().bankDetails;
  for (const field of [
    "bankName",
    "accountHolder",
    "cbuCvu",
    "cuitCuil",
    "alias",
  ]) {
    assert.ok(
      hasIssue(
        paidForm({ bankDetails: { ...bank, [field]: "" } }),
        `bankDetails.${field}`,
      ),
    );
  }
  assert.ok(
    hasIssue(
      paidForm({ bankDetails: { ...bank, bankName: "a".repeat(46) } }),
      "bankDetails.bankName",
    ),
  );
  assert.ok(
    hasIssue(
      paidForm({ bankDetails: { ...bank, cbuCvu: "1".repeat(21) } }),
      "bankDetails.cbuCvu",
    ),
  );
  assert.ok(
    hasIssue(
      paidForm({ bankDetails: { ...bank, cuitCuil: "1".repeat(21) } }),
      "bankDetails.cuitCuil",
    ),
  );
});

test("la confirmación de creación acepta solo el estado de navegación esperado", () => {
  assert.equal(getCongressCreationMessage(null), null);
  assert.equal(getCongressCreationMessage({ createdCongressName: 1 }), null);
  assert.equal(
    getCongressCreationMessage({ createdCongressName: "Congreso A" }),
    "El congreso «Congreso A» se creó correctamente.",
  );
});
