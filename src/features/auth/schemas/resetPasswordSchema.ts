import { z } from "zod";

/**
 * Schema de validación para el formulario
 * de creación de una nueva contraseña.
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede superar los 100 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Debés confirmar la contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;