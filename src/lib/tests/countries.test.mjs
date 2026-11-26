import assert from "node:assert/strict";
import test from "node:test";
import { countries, getCountryOptions } from "../countries.ts";

test("catálogo español completo con códigos y nombres únicos", () => {
  assert.equal(countries.length, 250);
  assert.equal(
    new Set(countries.map(({ code }) => code)).size,
    countries.length,
  );
  assert.equal(
    new Set(countries.map(({ name }) => name)).size,
    countries.length,
  );
  for (const { code, name } of countries) {
    assert.match(code, /^[A-Z]{2}$/);
    assert.ok(name.trim().length > 0);
    assert.equal(name, name.trim());
  }
  for (const [code, name] of [
    ["AR", "Argentina"],
    ["BR", "Brasil"],
    ["ES", "España"],
    ["MX", "México"],
  ]) {
    assert.equal(
      countries.find((country) => country.code === code)?.name,
      name,
    );
  }
});

test("opciones ordenadas alfabéticamente en español", () => {
  const names = countries.map(({ name }) => name);
  assert.deepEqual(
    names,
    [...names].sort((first, second) => first.localeCompare(second, "es")),
  );
});

test("registro y primer ingreso parten del mismo catálogo sin preselección", () => {
  assert.equal(getCountryOptions(), countries);
  assert.equal(getCountryOptions(""), countries);
  assert.equal(getCountryOptions("Argentina"), countries);
});

test("perfil conserva países guardados fuera del catálogo sin modificar la lista compartida", () => {
  const options = getCountryOptions("United States");
  assert.equal(options[0].name, "United States");
  assert.equal(options.length, countries.length + 1);
  assert.equal(countries.length, 250);
  assert.equal(
    getCountryOptions("Argentina").filter(({ name }) => name === "Argentina")
      .length,
    1,
  );
});
