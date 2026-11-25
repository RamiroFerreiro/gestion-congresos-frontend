import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError } from "axios";
import { QueryClient } from "@tanstack/react-query";
import {
  canApplyForCoauthorship,
  canManageCoauthorship,
  getCatalogPage,
  getCoauthorshipError,
} from "../lib/coauthorship.ts";
import { invalidateCoauthorshipQueries } from "../lib/coauthorshipQueries.ts";
import { getSubmissionAvailability } from "../utils/submissionAvailability.ts";

const participant = {
  active: true,
  institution: "Universidad",
  role: "LISTENER",
};

test("solo oyentes y expositores activos con institución pueden solicitar", () => {
  for (const role of ["LISTENER", "EXPOSITOR"])
    assert.equal(canApplyForCoauthorship({ ...participant, role }), true);
  for (const role of ["ADMINISTRATOR", "EVALUATOR", "UNKNOWN"])
    assert.equal(canApplyForCoauthorship({ ...participant, role }), false);
  assert.equal(canApplyForCoauthorship(undefined), false);
  assert.equal(
    canApplyForCoauthorship({ ...participant, active: false }),
    false,
  );
  assert.equal(
    canApplyForCoauthorship({ ...participant, institution: " " }),
    false,
  );
  assert.equal(canApplyForCoauthorship(participant, true), false);
});

test("Solicitudes aparece para el responsable de cada borrador sin depender del filtro", () => {
  assert.equal(
    canManageCoauthorship({ responsibleAuthor: true, status: "NOT_SUBMITTED" }),
    true,
  );
  assert.equal(
    canManageCoauthorship({
      responsibleAuthor: false,
      status: "NOT_SUBMITTED",
    }),
    false,
  );
  for (const status of [
    "UNDER_EVALUATION",
    "ACCEPTED",
    "NEEDS_REVISION",
    "REJECTED",
  ])
    assert.equal(
      canManageCoauthorship({ responsibleAuthor: true, status }),
      false,
    );
});

test("la ventana de coautoría incluye ambos extremos y requiere congreso habilitado", () => {
  const rules = {
    enabled: true,
    presentationStartDate: "2026-11-01T09:00:00",
    presentationEndDate: "2026-11-30T18:00:00",
  };
  for (const value of [rules.presentationStartDate, rules.presentationEndDate])
    assert.equal(
      getSubmissionAvailability(rules, new Date(value)).isOpen,
      true,
    );
  assert.equal(
    getSubmissionAvailability(rules, new Date("2026-11-01T08:59:59")).isOpen,
    false,
  );
  assert.equal(
    getSubmissionAvailability(rules, new Date("2026-11-30T18:00:01")).isOpen,
    false,
  );
  assert.equal(
    getSubmissionAvailability(
      { ...rules, enabled: false },
      new Date(rules.presentationStartDate),
    ).isOpen,
    false,
  );
});

test("paginación inválida vuelve al inicio", () => {
  for (const value of [null, "", "-1", "1.5", "NaN", "9007199254740992"])
    assert.equal(getCatalogPage(value), 0);
  assert.equal(getCatalogPage("3"), 3);
});

test("errores de validación se conservan y fallas de consulta no se convierten en vacío", () => {
  const error = new AxiosError("falló");
  assert.match(getCoauthorshipError(error), /conectar/);
  error.response = {
    status: 400,
    data: { message: "Se superó el máximo de autores" },
  };
  assert.equal(getCoauthorshipError(error), error.response.data.message);
  error.response.status = 409;
  assert.equal(getCoauthorshipError(error), error.response.data.message);
  for (const [status, pattern] of [
    [401, /sesión/],
    [428, /primer ingreso/],
    [500, /más tarde/],
  ]) {
    error.response.status = status;
    assert.match(getCoauthorshipError(error), pattern);
  }
});

test("invalidaciones actualizan solo el usuario, congreso y trabajo involucrados", async () => {
  const client = new QueryClient();
  const matching = [
    ["coauthorship-catalog", 7, "C-1", "buscar", 0],
    ["paper-author-requests", 7, "C-1", "P-1"],
    ["paper-detail", 7, "P-1"],
    ["paper-submission-paper", 7, "P-1"],
    ["participant-paper-inbox", 7, "C-1", "NOT_SUBMITTED", 0, 10],
    ["presenter-home", 7, "C-1"],
  ];
  const unrelated = [
    ["paper-author-requests", 7, "C-1", "P-2"],
    ["coauthorship-catalog", 8, "C-1"],
    ["participant-paper-inbox", 7, "C-2"],
  ];
  for (const key of [...matching, ...unrelated])
    client.setQueryData(key, { test: true });
  await invalidateCoauthorshipQueries(client, 7, "C-1", "P-1");
  for (const key of matching)
    assert.equal(client.getQueryState(key).isInvalidated, true);
  for (const key of unrelated)
    assert.equal(client.getQueryState(key).isInvalidated, false);
  client.clear();
});
