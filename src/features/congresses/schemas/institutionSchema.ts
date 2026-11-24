import { z } from "zod";

export const institutionSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(1, "La institución es obligatoria.")
    .max(255, "La institución no puede superar los 255 caracteres."),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;
