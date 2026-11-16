import { z } from "zod";
import type {
  PaperCongressRules,
  PaperSubmissionFormValues,
} from "../types/paperSubmission";

interface SchemaOptions {
  enforceMinimumKeywords?: boolean;
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("es-AR");
}

export function parseKeywords(rawKeywords: string): string[] {
  return rawKeywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function getSummaryText(summary: string) {
  return summary
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .trim();
}

export function createPaperSubmissionSchema(
  rules: Pick<
    PaperCongressRules,
    "thematicAreas" | "keywordRepetition" | "minKeywords" | "maxKeywords"
  >,
  { enforceMinimumKeywords = false }: SchemaOptions = {},
) {
  return z
    .object({
      title: z.string().trim().min(1, "El título es obligatorio."),
      thematicArea: z
        .string()
        .trim()
        .min(1, "El área temática es obligatoria."),
      keywords: z.string().trim().min(1, "Ingresá al menos una palabra clave."),
      summary: z
        .string()
        .refine(
          (value) => getSummaryText(value).length > 0,
          "El resumen es obligatorio.",
        ),
    })
    .superRefine((values, context) => {
      if (!rules.thematicAreas.includes(values.thematicArea)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["thematicArea"],
          message: "Seleccioná un área temática habilitada para este congreso.",
        });
      }

      const keywords = parseKeywords(values.keywords);
      const uniqueKeywords = new Set(keywords.map(normalized));

      if (keywords.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["keywords"],
          message: "Ingresá al menos una palabra clave.",
        });
      }

      if (uniqueKeywords.size !== keywords.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["keywords"],
          message: "No repitas palabras clave.",
        });
      }

      if (keywords.length > rules.maxKeywords) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["keywords"],
          message: `El congreso permite hasta ${rules.maxKeywords} palabras clave.`,
        });
      }

      if (enforceMinimumKeywords && keywords.length < rules.minKeywords) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["keywords"],
          message: `El congreso requiere al menos ${rules.minKeywords} palabras clave para enviar el trabajo.`,
        });
      }

      if (rules.keywordRepetition) {
        const title = normalized(values.title);
        const repeatedInTitle = keywords.some((keyword) =>
          title.includes(normalized(keyword)),
        );

        if (repeatedInTitle) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["keywords"],
            message:
              "Las palabras clave no pueden repetirse dentro del título del trabajo.",
          });
        }
      }
    });
}

export type PaperSubmissionSchemaValues = PaperSubmissionFormValues;
