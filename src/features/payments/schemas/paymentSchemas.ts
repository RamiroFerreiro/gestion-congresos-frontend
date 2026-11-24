import { z } from "zod";

export const paperLookupSchema = z.object({
  paperCode: z.string().trim().min(1, "Ingresá el código del trabajo."),
});

export const receiptSchema = z.object({
  file: z
    .instanceof(File, { message: "Seleccioná un comprobante." })
    .refine((file) => file.size > 0, "El archivo no puede estar vacío.")
    .refine(
      (file) =>
        /\.(pdf|png|jpe?g)$/i.test(file.name) &&
        (!file.type ||
          ["application/pdf", "image/png", "image/jpeg"].includes(file.type)),
      "El comprobante debe ser un archivo PDF, PNG o JPG.",
    ),
});

export const reviewSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    observations: z
      .string()
      .trim()
      .max(255, "El motivo admite hasta 255 caracteres."),
  })
  .superRefine((value, context) => {
    if (value.status === "REJECTED" && !value.observations) {
      context.addIssue({
        code: "custom",
        path: ["observations"],
        message: "Ingresá el motivo del rechazo.",
      });
    }
  });

export type PaperLookupValues = z.infer<typeof paperLookupSchema>;
export type ReceiptValues = z.infer<typeof receiptSchema>;
export type ReviewValues = z.infer<typeof reviewSchema>;
