import { z } from "zod";

/**
 * Schema de validación para el formulario
 * de creación de una nueva contraseña.
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "La contraseña es obligatoria"),

    confirmPassword: z
      .string()
      .min(1, "Debés confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

/**
 * Tipo del formulario generado directamente desde el schema.
 */
export type ResetPasswordFormData = z.infer<
  typeof resetPasswordSchema
>;