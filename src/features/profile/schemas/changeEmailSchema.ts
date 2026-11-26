import { z } from "zod";

/**
 * Esquema de validación para el formulario de cambio de correo electrónico.
 * La validación de que el nuevo email sea distinto al actual
 * se realiza en el componente antes de invocar la mutación.
 */
export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .min(1, "El nuevo correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
});

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
