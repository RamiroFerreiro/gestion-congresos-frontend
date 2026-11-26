import type { PaperCongressRules } from "../types/paperSubmission";

export type SubmissionAvailability = {
  isOpen: boolean;
  message: string | null;
};

export function getSubmissionAvailability(
  congress: PaperCongressRules,
  now = new Date(),
): SubmissionAvailability {
  if (!congress.enabled) {
    return {
      isOpen: false,
      message:
        "El congreso se encuentra deshabilitado para la presentación de trabajos.",
    };
  }

  const start = new Date(congress.presentationStartDate);
  const end = new Date(congress.presentationEndDate);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return {
      isOpen: false,
      message:
        "El período de presentación del congreso no tiene fechas válidas.",
    };
  }

  if (now < start) {
    return {
      isOpen: false,
      message:
        "La presentación de trabajos todavía no se encuentra habilitada.",
    };
  }

  if (now > end) {
    return {
      isOpen: false,
      message: "El período de presentación de trabajos ya finalizó.",
    };
  }

  return { isOpen: true, message: null };
}
