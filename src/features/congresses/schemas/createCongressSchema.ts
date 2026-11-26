import { z } from "zod";

export const congressDateFields = [
  { name: "registrationStartDate", label: "Inicio de registro al congreso" },
  { name: "registrationEndDate", label: "Fin de registro al congreso" },
  { name: "presentationStartDate", label: "Inicio para presentar trabajos" },
  { name: "presentationEndDate", label: "Fin para presentar trabajos" },
  { name: "startDate", label: "Inicio del congreso" },
  { name: "endDate", label: "Fin del congreso" },
] as const;

function isLocalDateTime(value: string): boolean {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    value,
  );
  if (!parts) return false;
  const date = new Date(value);
  return (
    Number.isFinite(date.getTime()) &&
    date.getFullYear() === Number(parts[1]) &&
    date.getMonth() + 1 === Number(parts[2]) &&
    date.getDate() === Number(parts[3]) &&
    date.getHours() === Number(parts[4]) &&
    date.getMinutes() === Number(parts[5]) &&
    date.getSeconds() === Number(parts[6] ?? 0)
  );
}

const dateTime = z
  .string()
  .min(1, "Indicá la fecha y hora.")
  .refine(
    (value) => value === "" || isLocalDateTime(value),
    "Ingresá una fecha y hora válidas.",
  );
const optionalLimit = z
  .number()
  .int("Ingresá un número entero.")
  .min(1, "El límite debe ser al menos 1.")
  .max(2_147_483_647, "El límite supera el máximo admitido.")
  .nullable();

const bankDetailsSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(1, "Ingresá el banco.")
    .max(45, "Usá hasta 45 caracteres."),
  accountHolder: z
    .string()
    .trim()
    .min(1, "Ingresá el titular.")
    .max(255, "Usá hasta 255 caracteres."),
  cbuCvu: z.string().trim().length(22, "El CBU/CVU debe tener 22 caracteres."),
  cuitCuil: z
    .string()
    .trim()
    .min(1, "Ingresá el CUIT/CUIL.")
    .max(20, "Usá hasta 20 caracteres."),
  alias: z
    .string()
    .trim()
    .min(1, "Ingresá el alias.")
    .max(255, "Usá hasta 255 caracteres."),
});

export const createCongressSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresá el nombre del congreso."),
    place: z.string().trim().min(1, "Ingresá la sede del congreso."),
    contactMail: z
      .string()
      .trim()
      .min(1, "Ingresá el correo de contacto.")
      .email("Ingresá un correo válido."),
    thematicAreas: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Ingresá el nombre del área."),
        }),
      )
      .min(1, "Agregá al menos un área temática."),
    registrationStartDate: dateTime,
    registrationEndDate: dateTime,
    presentationStartDate: dateTime,
    presentationEndDate: dateTime,
    startDate: dateTime,
    endDate: dateTime,
    maxNumberOfAuthors: optionalLimit,
    minKeywords: optionalLimit,
    maxKeywords: optionalLimit,
    keywordRepetition: z.boolean(),
    singleBlind: z.boolean(),
    evaluationReleaseMode: z.enum(["IMMEDIATE", "BATCH"]),
    plannedEvaluationReleaseDate: z.string(),
    paid: z.boolean(),
    abstractAmount: z.string(),
    abstractCurrency: z.string(),
    bankDetails: z.object({
      bankName: z.string(),
      accountHolder: z.string(),
      cbuCvu: z.string(),
      cuitCuil: z.string(),
      alias: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    const now = Date.now();
    const names = congressDateFields.map(({ name }) => name);
    for (const name of names) {
      if (
        isLocalDateTime(data[name]) &&
        new Date(data[name]).getTime() <= now
      ) {
        ctx.addIssue({
          code: "custom",
          path: [name],
          message: "La fecha y hora deben ser futuras.",
        });
      }
    }
    // El backend exige rangos estrictos dentro de cada etapa y permite igualdad entre etapas.
    for (let i = 0; i < names.length - 1; i++) {
      const previous = data[names[i]];
      const current = data[names[i + 1]];
      if (!isLocalDateTime(previous) || !isLocalDateTime(current)) continue;
      const difference =
        new Date(current).getTime() - new Date(previous).getTime();
      if (difference < 0 || (i % 2 === 0 && difference === 0)) {
        ctx.addIssue({
          code: "custom",
          path: [names[i + 1]],
          message:
            i % 2 === 0
              ? "El fin de la etapa debe ser posterior a su inicio."
              : "Esta etapa no puede comenzar antes del fin de la anterior.",
        });
      }
    }
    if (
      data.minKeywords !== null &&
      data.maxKeywords !== null &&
      data.minKeywords > data.maxKeywords
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxKeywords"],
        message: "El máximo debe ser mayor o igual al mínimo.",
      });
    }
    const areas = new Set<string>();
    data.thematicAreas.forEach(({ name }, index) => {
      if (areas.has(name))
        ctx.addIssue({
          code: "custom",
          path: ["thematicAreas", index, "name"],
          message: "El área ya está agregada.",
        });
      areas.add(name);
    });
    if (data.evaluationReleaseMode === "BATCH") {
      if (!isLocalDateTime(data.plannedEvaluationReleaseDate)) {
        ctx.addIssue({
          code: "custom",
          path: ["plannedEvaluationReleaseDate"],
          message: "Indicá una fecha y hora de publicación válidas.",
        });
      } else if (new Date(data.plannedEvaluationReleaseDate).getTime() <= now) {
        ctx.addIssue({
          code: "custom",
          path: ["plannedEvaluationReleaseDate"],
          message: "La publicación debe ser futura.",
        });
      }
    }
    if (data.paid) {
      // CongressPaperType.amount es DECIMAL(10,2).
      if (
        !/^\d{1,8}(\.\d{1,2})?$/.test(data.abstractAmount) ||
        Number(data.abstractAmount) <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["abstractAmount"],
          message:
            "Ingresá un importe mayor a cero, hasta 99999999.99 y con hasta dos decimales.",
        });
      }
      if (!/^[A-Z]{3}$/.test(data.abstractCurrency.trim().toUpperCase())) {
        ctx.addIssue({
          code: "custom",
          path: ["abstractCurrency"],
          message:
            "Ingresá un código de moneda de tres letras, por ejemplo ARS.",
        });
      }
      const bank = bankDetailsSchema.safeParse(data.bankDetails);
      if (!bank.success)
        bank.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: "custom",
            path: ["bankDetails", ...issue.path],
            message: issue.message,
          });
        });
    }
  });

export type CreateCongressFormData = z.infer<typeof createCongressSchema>;

export const createCongressDefaults: CreateCongressFormData = {
  name: "",
  place: "",
  contactMail: "",
  thematicAreas: [],
  registrationStartDate: "",
  registrationEndDate: "",
  presentationStartDate: "",
  presentationEndDate: "",
  startDate: "",
  endDate: "",
  maxNumberOfAuthors: 6,
  minKeywords: 3,
  maxKeywords: 5,
  keywordRepetition: true,
  singleBlind: true,
  evaluationReleaseMode: "IMMEDIATE",
  plannedEvaluationReleaseDate: "",
  paid: false,
  abstractAmount: "",
  abstractCurrency: "",
  bankDetails: {
    bankName: "",
    accountHolder: "",
    cbuCvu: "",
    cuitCuil: "",
    alias: "",
  },
};
