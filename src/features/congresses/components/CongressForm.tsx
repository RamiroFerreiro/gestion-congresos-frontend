import type { FormEvent, HTMLInputTypeAttribute, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type FieldPathByValue,
  type FieldPath,
  type SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { esES } from "@mui/x-date-pickers/locales";
import "dayjs/locale/es";
import {
  congressDateFields,
  createCongressDefaults,
  createCongressSchema,
  type CreateCongressFormData,
} from "../schemas/createCongressSchema";
import CongressLimitField from "./CongressLimitField";
import CongressDateTimeField from "./CongressDateTimeField";

const datePickerLocaleText = {
  ...esES.components.MuiLocalizationProvider.defaultProps.localeText,
  fieldYearPlaceholder: ({ digitAmount }: { digitAmount: number }) =>
    "Y".repeat(digitAmount),
  fieldHoursPlaceholder: () => "HH",
  okButtonLabel: "Aceptar",
};

type CongressDateFieldName =
  (typeof congressDateFields)[number]["name"] | "plannedEvaluationReleaseDate";

const congressSteps: {
  label: string;
  description: string;
  fields: FieldPath<CreateCongressFormData>[];
}[] = [
  {
    label: "Datos generales",
    description: "Completá los datos generales para comenzar.",
    fields: ["name", "place", "contactMail", "thematicAreas"],
  },
  {
    label: "Fechas importantes",
    description:
      "Definí las fechas de registro, presentación de trabajos y realización.",
    fields: congressDateFields.map(({ name }) => name),
  },
  {
    label: "Reglas y evaluación",
    description:
      "Configurá las reglas de los trabajos y la publicación de evaluaciones.",
    fields: [
      "maxNumberOfAuthors",
      "minKeywords",
      "maxKeywords",
      "keywordRepetition",
      "evaluationReleaseMode",
      "plannedEvaluationReleaseDate",
      "singleBlind",
    ],
  },
  {
    label: "Pago",
    description:
      "Indicá si el congreso es pago y completá los datos correspondientes.",
    fields: [
      "paid",
      "bankDetails.bankName",
      "bankDetails.accountHolder",
      "bankDetails.cbuCvu",
      "bankDetails.alias",
      "bankDetails.cuitCuil",
      "abstractAmount",
      "abstractCurrency",
    ],
  },
];

interface Props {
  onSubmit: (data: CreateCongressFormData) => Promise<void>;
  isSubmitting: boolean;
  serverError: string | null;
}

function FormSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Paper
      component="section"
      variant="outlined"
      aria-labelledby={id}
      sx={{ p: 3, borderRadius: 2 }}
    >
      <Typography
        id={id}
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.25rem",
          fontWeight: 600,
          mb: 2.5,
        }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

type TextFieldName = FieldPathByValue<CreateCongressFormData, string>;

export default function CongressForm({
  onSubmit,
  isSubmitting,
  serverError,
}: Props) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(0);
  const advancing = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    clearErrors,
    getFieldState,
    trigger,
    formState,
  } = useForm<CreateCongressFormData>({
    resolver: zodResolver(createCongressSchema),
    defaultValues: createCongressDefaults,
    shouldUnregister: false,
    shouldFocusError: false,
  });
  const areas = useFieldArray({ control, name: "thematicAreas" });
  const paid = useWatch({ control, name: "paid" });
  const releaseMode = useWatch({ control, name: "evaluationReleaseMode" });
  // La lectura durante el render suscribe al componente a los cambios de isDirty.
  const isDirty = formState.isDirty;
  const busy = isSubmitting || formState.isSubmitting;
  const navigationDisabled = busy || formState.isValidating;
  const lastStep = congressSteps.length - 1;
  const step = congressSteps[activeStep];
  const stepHasErrors = step.fields.some(
    (name) => getFieldState(name, formState).invalid,
  );
  const serverErrorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (serverError) serverErrorRef.current?.focus();
  }, [serverError]);
  useEffect(() => {
    if (previousStep.current === activeStep) return;
    previousStep.current = activeStep;
    stepContentRef.current?.focus({ preventScroll: true });
    stepContentRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeStep]);
  const areasError =
    formState.errors.thematicAreas?.root?.message ??
    formState.errors.thematicAreas?.message;

  const handleCancel = () => {
    if (busy || advancing.current) return;
    if (isDirty) setExitDialogOpen(true);
    else navigate("/my-congresses");
  };

  const handleNext = async () => {
    if (busy || advancing.current || activeStep === lastStep) return;
    advancing.current = true;
    try {
      const fields = step.fields.filter(
        (name) =>
          name !== "plannedEvaluationReleaseDate" || releaseMode === "BATCH",
      );
      const valid = await trigger(fields, { shouldFocus: true });
      if (valid) setActiveStep(activeStep + 1);
    } finally {
      advancing.current = false;
    }
  };

  const handleInvalid: SubmitErrorHandler<CreateCongressFormData> = (
    errors,
  ) => {
    // RHF agrupa los errores de áreas y de cuenta bancaria por su campo raíz.
    const invalidStep = congressSteps.findIndex(({ fields }) =>
      fields.some(
        (name) => errors[name.split(".")[0] as keyof CreateCongressFormData],
      ),
    );
    if (invalidStep >= 0) setActiveStep(invalidStep);
    stepContentRef.current?.focus();
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || advancing.current || exitDialogOpen) return;
    // Enter en los pasos iniciales valida ese paso; nunca envía el congreso.
    if (activeStep !== lastStep) {
      void handleNext();
      return;
    }
    void handleSubmit(onSubmit, handleInvalid)(event);
  };

  const renderField = (
    name: TextFieldName,
    label: string,
    options: {
      type?: HTMLInputTypeAttribute;
      maxLength?: number;
      placeholder?: string;
    } = {},
  ) => {
    const error = getFieldState(name, formState).error;
    return (
      <Box key={name}>
        <Typography
          component="label"
          htmlFor={name}
          variant="body2"
          sx={{ display: "block", fontWeight: 600, mb: 0.75 }}
        >
          {label}
        </Typography>
        <TextField
          {...register(name)}
          id={name}
          fullWidth
          required
          disabled={busy}
          size="small"
          type={options.type ?? "text"}
          placeholder={options.placeholder}
          error={!!error}
          helperText={error?.message}
          slotProps={{
            htmlInput: {
              maxLength: options.maxLength,
            },
          }}
        />
      </Box>
    );
  };

  const renderDateField = (
    name: CongressDateFieldName,
    label: string,
    options: { labelInField?: boolean } = {},
  ) => (
    <Controller
      key={name}
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <CongressDateTimeField
          name={field.name}
          label={label}
          labelInField={options.labelInField}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          disabled={busy}
          error={fieldState.error?.message}
        />
      )}
    />
  );

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="es"
      localeText={datePickerLocaleText}
    >
      <Box component="form" noValidate onSubmit={handleFormSubmit}>
        <Button
          type="button"
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          disabled={navigationDisabled}
          sx={{
            alignSelf: "flex-start",
            px: 0,
            mb: 2,
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "transparent",
              color: "primary.main",
            },
          }}
        >
          Mis congresos
        </Button>
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2.25rem",
                  fontWeight: 700,
                }}
              >
                Crear nuevo congreso
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                {step.description}
              </Typography>
            </Box>
            <Typography
              aria-live="polite"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              Paso {activeStep + 1} de {congressSteps.length}
            </Typography>
          </Box>
          <Box component="nav" aria-label="Pasos de creación del congreso">
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                py: 1,
                "& .MuiStepIcon-root": { fontSize: 32 },
                "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed":
                  { color: "primary.main" },
                "& .MuiStepConnector-root": { top: 16 },
                "& .MuiStepConnector-line": { borderColor: "divider" },
                "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line":
                  { borderColor: "primary.main" },
                "& .MuiStepLabel-label": { color: "text.secondary" },
                "& .MuiStepLabel-label.Mui-active": {
                  color: "primary.dark",
                  fontWeight: 700,
                },
              }}
            >
              {congressSteps.map(({ label }, index) => (
                <Step
                  key={label}
                  aria-current={activeStep === index ? "step" : undefined}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {serverError && (
            <Alert ref={serverErrorRef} severity="error" tabIndex={-1}>
              {serverError}
            </Alert>
          )}
          {stepHasErrors && (
            <Alert severity="error">
              Revisá los campos marcados de este paso para continuar.
            </Alert>
          )}
          <Box
            ref={stepContentRef}
            role="region"
            aria-label={step.label}
            tabIndex={-1}
            sx={{ scrollMarginTop: 24 }}
          >
            <Box
              component="fieldset"
              disabled={busy}
              sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
            >
              <Stack spacing={2.5}>
                {activeStep === 0 && (
                  <FormSection
                    id="congress-general-title"
                    title="Datos generales"
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 3,
                      }}
                    >
                      {renderField("name", "Nombre del congreso")}
                      {renderField("place", "Sede")}
                      <Box sx={{ gridColumn: "1 / -1" }}>
                        {renderField(
                          "contactMail",
                          "Mail de contacto del congreso",
                          {
                            type: "email",
                            placeholder: "contacto@congreso.org",
                          },
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        mt: 3,
                        pt: 2.5,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        component="h3"
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Áreas temáticas habilitadas
                      </Typography>
                      <Stack spacing={1.5}>
                        {areas.fields.map((area, index) => (
                          <Box
                            key={area.id}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                              maxWidth: 650,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              {renderField(
                                `thematicAreas.${index}.name`,
                                `Área temática ${index + 1}`,
                              )}
                            </Box>
                            <Button
                              type="button"
                              onClick={() => areas.remove(index)}
                              aria-label={`Quitar área temática ${index + 1}`}
                              sx={{ mt: 3 }}
                            >
                              Quitar
                            </Button>
                          </Box>
                        ))}
                      </Stack>
                      {areasError && (
                        <Typography
                          role="alert"
                          variant="body2"
                          color="error"
                          sx={{ mt: 1 }}
                        >
                          {areasError}
                        </Typography>
                      )}
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => areas.append({ name: "" })}
                        sx={{ mt: 1.5, borderStyle: "dashed" }}
                      >
                        + Agregar área
                      </Button>
                    </Box>
                  </FormSection>
                )}

                {activeStep === 1 && (
                  <FormSection
                    id="congress-dates-title"
                    title="Fechas importantes"
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 3,
                      }}
                    >
                      {congressDateFields.map(({ name, label }) =>
                        renderDateField(name, label),
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2.5 }}
                    >
                      Indicá fechas y horas futuras, en el horario local. El
                      registro debe finalizar antes de comenzar la presentación
                      de trabajos, y la presentación antes del inicio del
                      congreso.
                    </Typography>
                  </FormSection>
                )}

                {activeStep === 2 && (
                  <Stack spacing={2.5}>
                    <FormSection
                      id="congress-paper-rules-title"
                      title="Reglas del trabajo científico"
                    >
                      <Stack divider={<Divider />}>
                        {(
                          [
                            [
                              "maxNumberOfAuthors",
                              "Máximo de autores por trabajo",
                            ],
                            ["minKeywords", "Mínimo de palabras clave"],
                            ["maxKeywords", "Máximo de palabras clave"],
                          ] as const
                        ).map(([name, label]) => (
                          <Controller
                            key={name}
                            name={name}
                            control={control}
                            render={({ field, fieldState }) => (
                              <CongressLimitField
                                id={name}
                                label={label}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                error={fieldState.error?.message}
                              />
                            )}
                          />
                        ))}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            py: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              component="label"
                              htmlFor="keywordRepetition"
                              sx={{ fontWeight: 600 }}
                            >
                              Validar repetición de palabras clave
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              Impide usar palabras clave que aparezcan en el
                              título.
                            </Typography>
                          </Box>
                          <Controller
                            name="keywordRepetition"
                            control={control}
                            render={({ field }) => (
                              <Switch
                                disabled={busy}
                                id="keywordRepetition"
                                name={field.name}
                                checked={field.value}
                                onChange={(_, checked) =>
                                  field.onChange(checked)
                                }
                                onBlur={field.onBlur}
                                slotProps={{ input: { ref: field.ref } }}
                              />
                            )}
                          />
                        </Box>
                      </Stack>
                    </FormSection>

                    <FormSection
                      id="congress-evaluation-title"
                      title="Evaluación de trabajos"
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 3,
                        }}
                      >
                        <Controller
                          name="evaluationReleaseMode"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              select
                              disabled={busy}
                              fullWidth
                              size="small"
                              label="Modalidad de publicación de evaluaciones"
                              name={field.name}
                              value={field.value}
                              onBlur={field.onBlur}
                              inputRef={field.ref}
                              onChange={(event) => {
                                field.onChange(event);
                                if (event.target.value === "IMMEDIATE") {
                                  setValue("plannedEvaluationReleaseDate", "");
                                  clearErrors("plannedEvaluationReleaseDate");
                                }
                              }}
                            >
                              <MenuItem value="IMMEDIATE">Inmediata</MenuItem>
                              <MenuItem value="BATCH">
                                Por lote (batch)
                              </MenuItem>
                            </TextField>
                          )}
                        />
                        {releaseMode === "BATCH" &&
                          renderDateField(
                            "plannedEvaluationReleaseDate",
                            "Fecha de publicación por lote",
                            { labelInField: true },
                          )}
                        <Controller
                          name="singleBlind"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              select
                              disabled={busy}
                              fullWidth
                              size="small"
                              label="Tipo de anonimato"
                              name={field.name}
                              value={field.value ? "single" : "double"}
                              onBlur={field.onBlur}
                              inputRef={field.ref}
                              onChange={(event) =>
                                field.onChange(event.target.value === "single")
                              }
                            >
                              <MenuItem value="single">Simple ciego</MenuItem>
                              <MenuItem value="double">Doble ciego</MenuItem>
                            </TextField>
                          )}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2.5 }}
                      >
                        La modalidad determina cuándo se publican los resultados
                        de las evaluaciones.
                      </Typography>
                    </FormSection>
                  </Stack>
                )}

                {activeStep === 3 && (
                  <Paper
                    component="section"
                    variant="outlined"
                    aria-labelledby="congress-payment-title"
                    sx={{ p: 3, borderRadius: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          id="congress-payment-title"
                          component="h2"
                          sx={{ fontSize: "1rem", fontWeight: 600 }}
                        >
                          <label htmlFor="paid">Congreso pago</label>
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Los trabajos aprobados deberán abonar el arancel para
                          ser incluidos en el Libro.
                        </Typography>
                      </Box>
                      <Controller
                        name="paid"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            disabled={busy}
                            id="paid"
                            name={field.name}
                            checked={field.value}
                            onBlur={field.onBlur}
                            slotProps={{ input: { ref: field.ref } }}
                            onChange={(_, checked) => {
                              field.onChange(checked);
                              if (!checked)
                                clearErrors([
                                  "abstractAmount",
                                  "abstractCurrency",
                                  "bankDetails",
                                ]);
                            }}
                          />
                        )}
                      />
                    </Box>
                    {paid && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          component="h3"
                          sx={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "1.05rem",
                            mb: 1,
                          }}
                        >
                          Datos de pago para presentadores
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Los presentadores con trabajo aprobado deberán
                          transferir a esta cuenta y subir su comprobante a la
                          plataforma.
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 3,
                          }}
                        >
                          {renderField("bankDetails.bankName", "Banco", {
                            maxLength: 45,
                          })}
                          {renderField(
                            "bankDetails.accountHolder",
                            "Titular de la cuenta",
                            { maxLength: 255 },
                          )}
                          {renderField("bankDetails.cbuCvu", "CBU/CVU", {
                            maxLength: 22,
                          })}
                          {renderField("bankDetails.alias", "Alias", {
                            maxLength: 255,
                          })}
                          {renderField("bankDetails.cuitCuil", "CUIT/CUIL", {
                            maxLength: 20,
                          })}
                          {renderField("abstractAmount", "Monto del arancel", {
                            placeholder: "0.00",
                          })}
                          {renderField("abstractCurrency", "Moneda", {
                            maxLength: 3,
                            placeholder: "ARS",
                          })}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                )}
              </Stack>
            </Box>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={
                activeStep === 0
                  ? handleCancel
                  : () => {
                      if (!busy && !advancing.current)
                        setActiveStep(activeStep - 1);
                    }
              }
              disabled={navigationDisabled}
              sx={{ minWidth: 140, px: 3, py: 1.25 }}
            >
              {activeStep === 0 ? "Cancelar" : "Atrás"}
            </Button>
            {activeStep === lastStep ? (
              <Button
                key="create"
                type="submit"
                variant="contained"
                disabled={navigationDisabled}
                startIcon={
                  busy ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{ width: 240, px: 3, py: 1.25 }}
              >
                {busy ? "Creando congreso…" : "Crear congreso"}
              </Button>
            ) : (
              <Button
                key="continue"
                type="button"
                variant="contained"
                disabled={navigationDisabled}
                onClick={() => void handleNext()}
                endIcon={<span aria-hidden="true">→</span>}
                sx={{ width: 240, px: 3, py: 1.25 }}
              >
                Continuar
              </Button>
            )}
          </Box>
        </Stack>
      </Box>
      <Dialog
        open={exitDialogOpen}
        onClose={() => {
          if (!busy) setExitDialogOpen(false);
        }}
        aria-labelledby="exit-congress-title"
        aria-describedby="exit-congress-description"
      >
        <DialogTitle id="exit-congress-title">
          ¿Salir del formulario?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="exit-congress-description">
            Los datos ingresados no se guardarán.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            autoFocus
            disabled={busy}
            onClick={() => setExitDialogOpen(false)}
          >
            Seguir editando
          </Button>
          <Button
            type="button"
            variant="contained"
            disabled={busy}
            onClick={() => {
              if (!busy) navigate("/my-congresses");
            }}
          >
            Salir sin guardar
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
