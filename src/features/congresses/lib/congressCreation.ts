import type { CreateCongressFormData } from "../schemas/createCongressSchema";
import type { CreateCongressRequest } from "../types/createCongress";

// LocalDateTime se envía sin convertir a UTC ni agregar un offset.
const localDateTime = (value: string) =>
  value.length === 16 ? `${value}:00` : value;

export function toCreateCongressRequest(
  data: CreateCongressFormData,
): CreateCongressRequest {
  return {
    name: data.name.trim(),
    place: data.place.trim(),
    contactMail: data.contactMail.trim(),
    thematicAreas: data.thematicAreas.map(({ name }) => name.trim()),
    registrationStartDate: localDateTime(data.registrationStartDate),
    registrationEndDate: localDateTime(data.registrationEndDate),
    presentationStartDate: localDateTime(data.presentationStartDate),
    presentationEndDate: localDateTime(data.presentationEndDate),
    startDate: localDateTime(data.startDate),
    endDate: localDateTime(data.endDate),
    maxNumberOfAuthors: data.maxNumberOfAuthors,
    minKeywords: data.minKeywords,
    maxKeywords: data.maxKeywords,
    keywordRepetition: data.keywordRepetition,
    singleBlind: data.singleBlind,
    evaluationReleaseMode: data.evaluationReleaseMode,
    plannedEvaluationReleaseDate:
      data.evaluationReleaseMode === "BATCH"
        ? localDateTime(data.plannedEvaluationReleaseDate)
        : null,
    free: !data.paid,
    abstractAmount: data.paid ? Number(data.abstractAmount) : 0,
    abstractCurrency: data.paid
      ? data.abstractCurrency.trim().toUpperCase()
      : null,
    bankDetailRequestDTO: data.paid
      ? {
          bankName: data.bankDetails.bankName.trim(),
          accountHolder: data.bankDetails.accountHolder.trim(),
          cbuCvu: data.bankDetails.cbuCvu.trim(),
          cuitCuil: data.bankDetails.cuitCuil.trim(),
          alias: data.bankDetails.alias.trim(),
        }
      : null,
  };
}

export function getCongressCreationMessage(state: unknown): string | null {
  if (
    state &&
    typeof state === "object" &&
    "createdCongressName" in state &&
    typeof state.createdCongressName === "string"
  ) {
    return `El congreso «${state.createdCongressName}» se creó correctamente.`;
  }
  return null;
}
