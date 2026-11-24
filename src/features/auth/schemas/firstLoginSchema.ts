import { z } from "zod";

/**
 * Esquema de validación para el formulario de primer inicio de sesión.
 * Exige cambiar la contraseña temporal y completar datos obligatorios (DNI y país).
 */
export const firstLoginSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .max(32, "La nueva contraseña no puede superar los 32 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá la nueva contraseña"),
    dni: z
      .string()
      .trim()
      .min(1, "El DNI es obligatorio")
      .regex(/^\d+$/, "El DNI solo puede contener números")
      .refine(
        (val) => {
          const num = parseInt(val, 10);
          return !isNaN(num) && num > 0;
        },
        { message: "El DNI debe ser un número positivo" },
      ),
    country: z.string().trim().min(1, "El país de residencia es obligatorio"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type FirstLoginFormData = z.infer<typeof firstLoginSchema>;
