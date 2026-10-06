import { z } from "zod";

/**
 * Schema de validación para el formulario de registro.
 *
 * Todos los campos son obligatorios.
 * Por el momento solo se aplican las reglas definidas
 * para esta etapa del flujo de autenticación.
 */
export const registerSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es obligatorio"),

    lastName: z.string().min(1, "El apellido es obligatorio"),

    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio")
      .email("Ingresá un correo electrónico válido"),

    dni: z
      .string()
      .min(1, "El DNI es obligatorio")
      .regex(/^\d+$/, "El DNI solo puede contener números"),

    institution: z.string().min(1, "La institución es obligatoria"),

    country: z.string().min(1, "El país es obligatorio"),

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
 * El tipo del formulario se obtiene directamente del schema
 * para mantener TypeScript y las validaciones sincronizados.
 */
export type RegisterFormData = z.infer<typeof registerSchema>;