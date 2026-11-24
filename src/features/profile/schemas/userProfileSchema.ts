import { z } from "zod";

/**
 * Esquema de validación para la edición del perfil de usuario.
 * Solo contempla los datos editables permitidos por el backend.
 */
export const userProfileSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  dni: z
    .string()
    .trim()
    .min(1, "El DNI es obligatorio")
    .regex(/^\d+$/, "El DNI solo puede contener números"),
  country: z.string().trim().min(1, "El país es obligatorio"),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
