import { z } from "zod";

/**
 * Schema de validación para el formulario
 * de recuperación de contraseña.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),
});

/**
 * Tipo del formulario generado a partir del schema.
 */
export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;