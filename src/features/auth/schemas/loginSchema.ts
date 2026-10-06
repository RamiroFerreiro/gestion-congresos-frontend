import { z } from "zod";

/**
 * Schema de validación para el formulario de inicio de sesión.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

/**
 * Tipo del formulario generado directamente desde el schema.
 */
export type LoginFormData = z.infer<typeof loginSchema>;