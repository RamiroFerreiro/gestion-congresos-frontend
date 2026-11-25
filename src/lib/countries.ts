import countryData from "./data/countries.es.json" with { type: "json" };

export interface CountryOption {
  code: string;
  name: string;
}

// Snapshot español de i18n-iso-countries (24/11/2026).
// Fuente y licencia: docs/licenses/i18n-iso-countries.txt.
const countryNames: Record<string, string | string[]> = countryData.countries;

export const countries: readonly CountryOption[] = Object.entries(countryNames)
  .map(([code, names]) => ({
    code,
    name: Array.isArray(names) ? names[0] : names,
  }))
  .sort((first, second) => first.name.localeCompare(second.name, "es"));

export function getCountryOptions(currentValue = ""): readonly CountryOption[] {
  if (
    !currentValue ||
    countries.some((country) => country.name === currentValue)
  ) {
    return countries;
  }

  // El perfil ya admite texto libre: conservar el dato guardado hasta que el
  // usuario elija reemplazarlo, sin renombrar países ni modificar datos existentes.
  return [{ code: "saved-country", name: currentValue }, ...countries];
}
